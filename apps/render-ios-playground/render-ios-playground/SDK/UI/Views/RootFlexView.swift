import UIKit
import FlexLayout

// MARK: - Safe Area Options
struct SafeAreaOptions: OptionSet {
    let rawValue: Int
    
    static let top        = SafeAreaOptions(rawValue: 1 << 0)
    static let bottom     = SafeAreaOptions(rawValue: 1 << 1)
    static let left       = SafeAreaOptions(rawValue: 1 << 2)
    static let right      = SafeAreaOptions(rawValue: 1 << 3)
    
    static let vertical   : SafeAreaOptions = [.top, .bottom]
    static let horizontal : SafeAreaOptions = [.left, .right]
    static let all        : SafeAreaOptions = [.top, .bottom, .left, .right]
}

// MARK: - Scenario Observer Wrapper
fileprivate class ScenarioObserverObject: ScenarioObserver {
    let scenarioKey: String
    let onChange: (Scenario) -> Void
    
    init(scenarioKey: String, onChange: @escaping (Scenario) -> Void) {
        self.scenarioKey = scenarioKey
        self.onChange = onChange
    }
    
    func onScenarioUpdate(scenario: Scenario) {
        onChange(scenario)
    }
}

// MARK: - RootFlexView
class RootFlexView: UIView {
    private let logger = DIContainer.shared.currentLogger
    private let repository = DIContainer.shared.scenarioRepository
    
    private var currentObserver: ScenarioObserverObject?
    private let safeArea: SafeAreaOptions
    
    var scenario: Scenario? {
        didSet { onScenarioChanged(scenario) }
    }
    
    // MARK: - Init
    init(safeArea: SafeAreaOptions = .all, scenario: Scenario? = nil) {
        self.safeArea = safeArea
        self.scenario = scenario
        super.init(frame: .zero)
        backgroundColor = .systemBackground
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    // MARK: - Lifecycle
    override func safeAreaInsetsDidChange() {
        super.safeAreaInsetsDidChange()
        applySafeAreaInsets()
        setNeedsLayout()
    }
    
    override func didMoveToWindow() {
        super.didMoveToWindow()
        if window != nil, let scenario = scenario {
            subscribe(to: scenario)
        } else {
            unsubscribe()
        }
    }
    
    override func willMove(toSuperview newSuperview: UIView?) {
        if newSuperview == nil {
            // Explicitly unsubscribing if removed from superview
            unsubscribe()
        }
        super.willMove(toSuperview: newSuperview)
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        frame = superview?.bounds ?? .zero
        flex.layout(mode: .fitContainer)
    }
    
    // MARK: - Scenario Handling
    private func onScenarioChanged(_ scenario: Scenario?) {
        guard let scenario = scenario else { return }
        
        subviews.forEach { $0.removeFromSuperview() }
        renderScenario(scenario: scenario)
        subscribe(to: scenario)
    }
    
    private func subscribe(to scenario: Scenario) {
        if currentObserver?.scenarioKey == scenario.key {
            return
        } else {
            unsubscribe()
        }
        
        let observer = ScenarioObserverObject(
            scenarioKey: scenario.key,
            onChange: { [weak self] scenario in
                self?.onScenarioChanged(scenario)
            }
        )
        
        Task {
            try? await repository.subscribeToScenario(observer)
        }
        
        currentObserver = observer
    }
    
    private func unsubscribe() {
        guard let observer = currentObserver else { return }
        Task {
            await repository.unsubscribeFromScenario(observer)
        }
        currentObserver = nil
    }
    
    // MARK: - Safe Area Insets
    private func applySafeAreaInsets() {
        let insets = safeAreaInsets
        flex.paddingTop(safeArea.contains(.top) ? insets.top : 0)
        flex.paddingBottom(safeArea.contains(.bottom) ? insets.bottom : 0)
        flex.paddingLeft(safeArea.contains(.left) ? insets.left : 0)
        flex.paddingRight(safeArea.contains(.right) ? insets.right : 0)
    }
    
    // MARK: - Rendering
    private func renderScenario(scenario: Scenario) {
        let builder = ViewTreeBuilder(scenario: scenario)
        guard let view = builder.buildViewTree(from: scenario.mainComponent) else {
            logger.warning("NO VIEW RENDERED FOR SCENARIO", category: "RootFlexView")
            return
        }
        
        flex.addItem(view)
        applySafeAreaInsets()
        
        setNeedsLayout()
        layoutIfNeeded()
        
        #if DEBUG
        logFlexTree()
        #endif
    }
}

