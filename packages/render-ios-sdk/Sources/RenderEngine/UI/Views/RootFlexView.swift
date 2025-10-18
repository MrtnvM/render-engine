import UIKit
import FlexLayout

// MARK: - Safe Area Options
public struct SafeAreaOptions: OptionSet, Sendable {
    public let rawValue: Int

    public init(rawValue: Int) {
        self.rawValue = rawValue
    }

    public static let top        = SafeAreaOptions(rawValue: 1 << 0)
    public static let bottom     = SafeAreaOptions(rawValue: 1 << 1)
    public static let left       = SafeAreaOptions(rawValue: 1 << 2)
    public static let right      = SafeAreaOptions(rawValue: 1 << 3)

    public static let vertical   : SafeAreaOptions = [.top, .bottom]
    public static let horizontal : SafeAreaOptions = [.left, .right]
    public static let all        : SafeAreaOptions = [.top, .bottom, .left, .right]
    public static let none       : SafeAreaOptions = []
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
    private let storeFactory = DIContainer.shared.storeFactory

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
        logger.debug("RootFlexView init with safeArea: \(safeArea.rawValue)", category: "RootFlexView")
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    // MARK: - Lifecycle
    override func safeAreaInsetsDidChange() {
        super.safeAreaInsetsDidChange()
        logger.debug("safeAreaInsetsDidChange: \(safeAreaInsets), safeArea config: \(safeArea.rawValue)", category: "RootFlexView")
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
        logger.debug("layoutSubviews - frame: \(frame), bounds: \(bounds), safeAreaInsets: \(safeAreaInsets)", category: "RootFlexView")
        flex.layout(mode: .fitContainer)
    }
    
    // MARK: - Scenario Handling
    private func onScenarioChanged(_ scenario: Scenario?) {
        guard let scenario = scenario else { return }
        
        logger.info("Scenario key: (\(scenario.key))", category: "Scneario")
        logger.info("Scenario Version: \(scenario.version)", category: "Scenario")
        
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
        let topPadding = safeArea.contains(.top) ? insets.top : 0
        let bottomPadding = safeArea.contains(.bottom) ? insets.bottom : 0
        let leftPadding = safeArea.contains(.left) ? insets.left : 0
        let rightPadding = safeArea.contains(.right) ? insets.right : 0

        logger.debug("Applying safe area padding - top: \(topPadding), bottom: \(bottomPadding), left: \(leftPadding), right: \(rightPadding)", category: "RootFlexView")

        flex.paddingTop(topPadding)
        flex.paddingBottom(bottomPadding)
        flex.paddingLeft(leftPadding)
        flex.paddingRight(rightPadding)
    }
    
    // MARK: - Rendering
    private func renderScenario(scenario: Scenario) {
        let store = storeFactory.makeStore(
            scope: .scenario(id: scenario.id),
            storage: .memory
        )
        let builder = ViewTreeBuilder(
            scenario: scenario,
            store: store,
            storeFactory: storeFactory
        )
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

