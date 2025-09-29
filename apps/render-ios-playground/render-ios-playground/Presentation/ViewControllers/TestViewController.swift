
import UIKit
import FlexLayout

public class TestViewController: UIViewController {
    
    private var logger: Logger { DIContainer.shared.currentLogger }
    private var repo = DIContainer.shared.scenarioRepository
    
    // Root flex container
    private let rootFlexContainer = UIView()
    
    private var scenario: Scenario = {
        let json: [String: Any?] = [
            "mainComponent": [
                "type": "Row",
                "style": [
                    "alignItems": "center",
                    "paddingHorizontal": 16,
                    "paddingVertical": 22,
                ],
                "children": [
                    [
                        "type": "Checkbox",
                        "style": [
                            "borderColor": "#0099F7",
                            "borderRadius": 4,
                            "marginRight": 16
                        ],
                        "properties": [],
                        "data": []
                    ],
                    [
                        "type": "Text",
                        "style": [
                            "fontSize": 15,
                            "fontWeight": 500,
                            "color": "#000000",
                            "backgroundColor": "#CCCCCC",
                            "borderRadius": 6,
                            "marginRight": 16,
                            "flexGrow": 1
                        ],
                        "properties": [
                            "text": "Выбрать все"
                        ],
                        "data": []
                    ],
                    [
                        "type": "Text",
                        "style": [
                            "fontSize": 15,
                            "fontWeight": 500,
                            "color": "#0099F7",
                            "backgroundColor": "#FFE4E1",
                        ],
                        "properties": [
                            "text": "Удалить (3)"
                        ],
                        "data": []
                    ]
                ],
                
            ]
        ]
        
        return Scenario.create(from: json)!
    }()
   
    override public func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .lightGray
        view.addSubview(rootFlexContainer)
        rootFlexContainer.backgroundColor = .gray
//        self.renderScenario(scenario: self.scenario)
        
        Task {
            let scenario = try! await self.repo.fetchScenario(key: "avito-cart")
            
            await MainActor.run {
                self.renderScenario(scenario: scenario)
            }
        }
    }
    
    public override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
    }
    
    public override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
    }

    override public func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()

        // Position the container to fill safe area
        rootFlexContainer.frame = CGRect(
            x: 0,
            y: 56,
            width: view.frame.width,
            height: view.frame.height
        )

        // Let flexbox layout itself
        rootFlexContainer.flex.layout(mode: .fitContainer)
    }

    private func renderScenario(scenario: Scenario) {
        let subview = buildViewTree(
            flex: rootFlexContainer.flex,
            component: scenario.mainComponent,
            scenario: scenario
        )
        rootFlexContainer.flex.addItem(subview!)
        rootFlexContainer.flex.layout(mode: .fitContainer)
        return
        
        let row = rootFlexContainer.flex.addItem()
        
        let checkboxComponent = try! Component.create(from: Config([
            "type": "Checkbox",
            "style": [
                "marginRight": 16,
            ],
            "properties": [],
            "data": []
        ]))
        
        let selectAllText = try! Component.create(from: Config([
            "type": "Text",
            "style": [],
            "properties": [
                "text": "Выбрать все"
            ],
            "data": []
        ]))
        
        let deleteText = try! Component.create(from: Config([
            "type": "Text",
            "style": [],
            "properties": [
                "text": "Удалить (3)"
            ],
            "data": []
        ]))
        
        
        row
            .direction(.row)
            .justifyContent(.start)
            .alignItems(.center)
            .padding(UIEdgeInsets(
                top: 16,
                left: 16,
                bottom: 16,
                right: 16
            ))
            .backgroundColor(.red)
        
        row.define { flex in
            flex.addItem(RenderableCheckbox(component: checkboxComponent))
            flex.addItem(RenderableText(component: selectAllText)).grow(1)
            flex.addItem(RenderableText(component: deleteText))
        }
    }
    
    func buildViewTree(flex: FlexLayout.Flex, component: Component, scenario: Scenario) -> UIView? {
        
        let builder = ViewTreeBuilder(
            scenario: scenario
        )
        
        return builder.buildViewTree(from: component)
    }
}
