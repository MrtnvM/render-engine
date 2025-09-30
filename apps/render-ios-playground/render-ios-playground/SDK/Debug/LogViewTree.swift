import UIKit
import yoga
import FlexLayout

extension UIView {
    /**
     * Recursively logs the Flexbox properties of this view and all its subviews.
     *
     * Call this in `viewDidLayoutSubviews()` after `flex.layout()` has been called
     * to see the final calculated frames and properties.
     */
    @MainActor
    public func logFlexTree(indent: String = "") {
        // Only print information for views that are part of the FlexLayout hierarchy
        guard self.yoga.isEnabled else { return }

        // 1. Basic View Information
        let viewDisplayName: String
        if let renderable = self as? Renderable {
            viewDisplayName = renderable.component.type
        } else {
            viewDisplayName = String(describing: type(of: self))
        }
        let frameDescription = String(format: "frame: (%.1f, %.1f, %.1f, %.1f)", self.frame.origin.x, self.frame.origin.y, self.frame.size.width, self.frame.size.height)
        
        print("\(indent)- \(viewDisplayName) - \(frameDescription)")

        // 2. Core Flexbox Properties
        let flex = self.flex
        var properties: [String] = []
        
        // Container Properties
        if flex.direction != .column { properties.append("direction: .\(flex.direction, default: "no direction")") }
        if yoga.justifyContent != .flexStart { properties.append("justifyContent: .\(justifyContentString())") }
        if yoga.alignItems != .stretch { properties.append("alignItems: .\(alignItemsString())") }
        
        // Item Properties
        if yoga.flexGrow != 0 {
            properties.append("grow: \(yoga.flexGrow)")
        }
        if yoga.flexShrink != 0 {
            properties.append("shrink: \(yoga.flexShrink)")
        }
    
        properties.append("width: \(widthString())")
        properties.append("height: \(heightString())")
        properties.append("aspectRatio: \(aspectRatioString())")
        
        // Spacing Properties (only print if not zero and not all undefined)
        if !isPaddingZero() && !isPaddingUndefined() { properties.append("padding: \(paddingString())") }
        if !isMarginZero() && !isMarginUndefined() { properties.append("margin: \(marginString())") }
        
        if !properties.isEmpty {
            print("\(indent)  └─ Flex: [\(properties.joined(separator: ", "))]")
        }

        // 3. Recurse into Subviews
        for subview in self.subviews {
            subview.logFlexTree(indent: indent + "  ")
        }
    }
    
    private func justifyContentString() -> String {
        switch yoga.justifyContent {
        case .center:
            return "center"
        case .flexStart:
            return "flexStart"
        case .flexEnd:
            return "flexEnd"
        case .spaceBetween:
            return "spaceBetween"
        case .spaceAround:
            return "spaceAround"
        case .spaceEvenly:
            return "spaceEvenly"
        @unknown default:
            return "unknown"
        }
    }
    
    private func alignItemsString() -> String {
        switch yoga.alignItems {
        case .auto:
            return "auto"
        case .flexStart:
            return "flexStart"
        case .center:
            return "center"
        case .flexEnd:
            return "flexEnd"
        case .stretch:
            return "stretch"
        case .baseline:
            return "baseline"
        case .spaceBetween:
            return "spaceBetween"
        case .spaceAround:
            return "spaceAround"
        case .spaceEvenly:
            return "spaceEvenly"
        @unknown default:
            return "unknown"
        }
    }
    
    // MARK: - Padding and Margin Helpers
    
    private func isPaddingZero() -> Bool {
        return yoga.paddingLeft.value == 0 && yoga.paddingTop.value == 0 && 
               yoga.paddingRight.value == 0 && yoga.paddingBottom.value == 0 &&
               yoga.paddingStart.value == 0 && yoga.paddingEnd.value == 0 &&
               yoga.paddingHorizontal.value == 0 && yoga.paddingVertical.value == 0 &&
               yoga.padding.value == 0
    }
    
    private func isMarginZero() -> Bool {
        return yoga.marginLeft.value == 0 && yoga.marginTop.value == 0 && 
               yoga.marginRight.value == 0 && yoga.marginBottom.value == 0 &&
               yoga.marginStart.value == 0 && yoga.marginEnd.value == 0 &&
               yoga.marginHorizontal.value == 0 && yoga.marginVertical.value == 0 &&
               yoga.margin.value == 0
    }
    
    private func paddingString() -> String {
        // Check if all values are undefined
        if isPaddingUndefined() {
            return "-"
        }
        
        // Check if all individual padding values are equal and not undefined
        let allEqual = yoga.paddingLeft.unit != .undefined && yoga.paddingTop.unit != .undefined &&
                      yoga.paddingLeft.value == yoga.paddingTop.value &&
                      yoga.paddingTop.value == yoga.paddingRight.value &&
                      yoga.paddingRight.value == yoga.paddingBottom.value &&
                      yoga.paddingBottom.value == yoga.paddingStart.value &&
                      yoga.paddingStart.value == yoga.paddingEnd.value &&
                      yoga.paddingEnd.value == yoga.paddingHorizontal.value &&
                      yoga.paddingHorizontal.value == yoga.paddingVertical.value &&
                      yoga.paddingVertical.value == yoga.padding.value
        
        if allEqual && yoga.padding.value != 0 {
            return "all (\(yogaValueString(yoga.padding)))"
        }
        
        // Check if horizontal and vertical are equal and not undefined
        let horizontalEqual = yoga.paddingLeft.unit != .undefined && yoga.paddingRight.unit != .undefined &&
                             yoga.paddingLeft.value == yoga.paddingRight.value &&
                             yoga.paddingHorizontal.unit != .undefined &&
                             yoga.paddingHorizontal.value == yoga.paddingLeft.value
        let verticalEqual = yoga.paddingTop.unit != .undefined && yoga.paddingBottom.unit != .undefined &&
                           yoga.paddingTop.value == yoga.paddingBottom.value &&
                           yoga.paddingVertical.unit != .undefined &&
                           yoga.paddingVertical.value == yoga.paddingTop.value
        
        if horizontalEqual && verticalEqual && yoga.paddingHorizontal.value != 0 && yoga.paddingVertical.value != 0 {
            return "horizontal (\(yogaValueString(yoga.paddingHorizontal))), vertical (\(yogaValueString(yoga.paddingVertical)))"
        }
        
        // Individual values - only include non-undefined, non-zero values
        var parts: [String] = []
        
        if yoga.paddingTop.unit != .undefined && yoga.paddingTop.value != 0 { 
            parts.append("top: \(yogaValueString(yoga.paddingTop))") 
        }
        if yoga.paddingRight.unit != .undefined && yoga.paddingRight.value != 0 { 
            parts.append("right: \(yogaValueString(yoga.paddingRight))") 
        }
        if yoga.paddingBottom.unit != .undefined && yoga.paddingBottom.value != 0 { 
            parts.append("bottom: \(yogaValueString(yoga.paddingBottom))") 
        }
        if yoga.paddingLeft.unit != .undefined && yoga.paddingLeft.value != 0 { 
            parts.append("left: \(yogaValueString(yoga.paddingLeft))") 
        }
        if yoga.paddingStart.unit != .undefined && yoga.paddingStart.value != 0 { 
            parts.append("start: \(yogaValueString(yoga.paddingStart))") 
        }
        if yoga.paddingEnd.unit != .undefined && yoga.paddingEnd.value != 0 { 
            parts.append("end: \(yogaValueString(yoga.paddingEnd))") 
        }
        if yoga.paddingHorizontal.unit != .undefined && yoga.paddingHorizontal.value != 0 { 
            parts.append("horizontal: \(yogaValueString(yoga.paddingHorizontal))") 
        }
        if yoga.paddingVertical.unit != .undefined && yoga.paddingVertical.value != 0 { 
            parts.append("vertical: \(yogaValueString(yoga.paddingVertical))") 
        }
        if yoga.padding.unit != .undefined && yoga.padding.value != 0 { 
            parts.append("all: \(yogaValueString(yoga.padding))") 
        }
        
        return parts.isEmpty ? "-" : parts.joined(separator: ", ")
    }
    
    private func marginString() -> String {
        // Check if all values are undefined
        if isMarginUndefined() {
            return "-"
        }
        
        // Check if all individual margin values are equal and not undefined
        let allEqual = yoga.marginLeft.unit != .undefined && yoga.marginTop.unit != .undefined &&
                      yoga.marginLeft.value == yoga.marginTop.value &&
                      yoga.marginTop.value == yoga.marginRight.value &&
                      yoga.marginRight.value == yoga.marginBottom.value &&
                      yoga.marginBottom.value == yoga.marginStart.value &&
                      yoga.marginStart.value == yoga.marginEnd.value &&
                      yoga.marginEnd.value == yoga.marginHorizontal.value &&
                      yoga.marginHorizontal.value == yoga.marginVertical.value &&
                      yoga.marginVertical.value == yoga.margin.value
        
        if allEqual && yoga.margin.value != 0 {
            return "all (\(yogaValueString(yoga.margin)))"
        }
        
        // Check if horizontal and vertical are equal and not undefined
        let horizontalEqual = yoga.marginLeft.unit != .undefined && yoga.marginRight.unit != .undefined &&
                             yoga.marginLeft.value == yoga.marginRight.value &&
                             yoga.marginHorizontal.unit != .undefined &&
                             yoga.marginHorizontal.value == yoga.marginLeft.value
        let verticalEqual = yoga.marginTop.unit != .undefined && yoga.marginBottom.unit != .undefined &&
                           yoga.marginTop.value == yoga.marginBottom.value &&
                           yoga.marginVertical.unit != .undefined &&
                           yoga.marginVertical.value == yoga.marginTop.value
        
        if horizontalEqual && verticalEqual && yoga.marginHorizontal.value != 0 && yoga.marginVertical.value != 0 {
            return "horizontal (\(yogaValueString(yoga.marginHorizontal))), vertical (\(yogaValueString(yoga.marginVertical)))"
        }
        
        // Individual values - only include non-undefined, non-zero values
        var parts: [String] = []
        
        if yoga.marginTop.unit != .undefined && yoga.marginTop.value != 0 { 
            parts.append("top: \(yogaValueString(yoga.marginTop))") 
        }
        if yoga.marginRight.unit != .undefined && yoga.marginRight.value != 0 { 
            parts.append("right: \(yogaValueString(yoga.marginRight))") 
        }
        if yoga.marginBottom.unit != .undefined && yoga.marginBottom.value != 0 { 
            parts.append("bottom: \(yogaValueString(yoga.marginBottom))") 
        }
        if yoga.marginLeft.unit != .undefined && yoga.marginLeft.value != 0 { 
            parts.append("left: \(yogaValueString(yoga.marginLeft))") 
        }
        if yoga.marginStart.unit != .undefined && yoga.marginStart.value != 0 { 
            parts.append("start: \(yogaValueString(yoga.marginStart))") 
        }
        if yoga.marginEnd.unit != .undefined && yoga.marginEnd.value != 0 { 
            parts.append("end: \(yogaValueString(yoga.marginEnd))") 
        }
        if yoga.marginHorizontal.unit != .undefined && yoga.marginHorizontal.value != 0 { 
            parts.append("horizontal: \(yogaValueString(yoga.marginHorizontal))") 
        }
        if yoga.marginVertical.unit != .undefined && yoga.marginVertical.value != 0 { 
            parts.append("vertical: \(yogaValueString(yoga.marginVertical))") 
        }
        if yoga.margin.unit != .undefined && yoga.margin.value != 0 { 
            parts.append("all: \(yogaValueString(yoga.margin))") 
        }
        
        return parts.isEmpty ? "-" : parts.joined(separator: ", ")
    }
    
    private func yogaValueString(_ value: YGValue) -> String {
        switch value.unit {
        case .point:
            return String(format: "%.1f", value.value)
        case .percent:
            return String(format: "%.1f%%", value.value)
        case .auto:
            return "auto"
        case .undefined:
            return "undefined"
        @unknown default:
            return "unknown"
        }
    }
    
    // MARK: - Width, Height, AspectRatio Helpers
    
    private func widthString() -> String {
        if yoga.width.unit == .undefined || yoga.width.value.isNaN {
            return "-"
        }
        return yogaValueString(yoga.width)
    }
    
    private func heightString() -> String {
        if yoga.height.unit == .undefined || yoga.height.value.isNaN {
            return "-"
        }
        return yogaValueString(yoga.height)
    }
    
    private func aspectRatioString() -> String {
        if yoga.aspectRatio.isNaN {
            return "-"
        }
        return String(format: "%.1f", yoga.aspectRatio)
    }
    
    // MARK: - Undefined Check Helpers
    
    private func isPaddingUndefined() -> Bool {
        return yoga.paddingLeft.unit == .undefined && yoga.paddingTop.unit == .undefined &&
               yoga.paddingRight.unit == .undefined && yoga.paddingBottom.unit == .undefined &&
               yoga.paddingStart.unit == .undefined && yoga.paddingEnd.unit == .undefined &&
               yoga.paddingHorizontal.unit == .undefined && yoga.paddingVertical.unit == .undefined &&
               yoga.padding.unit == .undefined
    }
    
    private func isMarginUndefined() -> Bool {
        return yoga.marginLeft.unit == .undefined && yoga.marginTop.unit == .undefined &&
               yoga.marginRight.unit == .undefined && yoga.marginBottom.unit == .undefined &&
               yoga.marginStart.unit == .undefined && yoga.marginEnd.unit == .undefined &&
               yoga.marginHorizontal.unit == .undefined && yoga.marginVertical.unit == .undefined &&
               yoga.margin.unit == .undefined
    }
}

// Helper extension to get a clean string representation of UIEdgeInsets
fileprivate extension UIEdgeInsets {
    func toString() -> String {
        if top == left && top == bottom && top == right {
            return String(format: "%.1f", top)
        } else {
            return String(format: "(t:%.1f, l:%.1f, b:%.1f, r:%.1f)", top, left, bottom, right)
        }
    }
}
