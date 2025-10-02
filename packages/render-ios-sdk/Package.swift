// swift-tools-version: 6.2
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "render-ios-sdk",
    products: [
        // Products define the executables and libraries a package produces, making them visible to other packages.
        .library(
            name: "render-ios-sdk",
            targets: ["render-ios-sdk"]
        ),
    ],
    targets: [
        // Targets are the basic building blocks of a package, defining a module or a test suite.
        // Targets can depend on other targets in this package and products from dependencies.
        .target(
            name: "render-ios-sdk"
        ),
        .testTarget(
            name: "render-ios-sdkTests",
            dependencies: ["render-ios-sdk"]
        ),
    ]
)
