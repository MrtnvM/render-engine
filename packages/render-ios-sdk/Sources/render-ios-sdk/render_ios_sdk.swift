// The Swift Programming Language
// https://docs.swift.org/swift-book

import Foundation

/// The main entry point for the Render iOS SDK
public class RenderSDK {
    
    @MainActor public static let shared = RenderSDK()
    
    private init() {}
    
    /// Initialize the SDK with configuration
    public func initialize(baseURL: String) {
        print("RenderSDK initialized with baseURL: \(baseURL)")
    }
    
    /// Get the SDK version
    public var version: String {
        return "1.0.0"
    }
}
