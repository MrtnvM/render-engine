// swift-tools-version: 6.0
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "render-ios-sdk",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        // Products define the executables and libraries a package produces, making them visible to other packages.
        .library(
            name: "RenderEngine",
            targets: ["RenderEngine"]
        ),
    ],
    dependencies: [
        .package(
            url: "https://github.com/layoutBox/FlexLayout.git",
            from: "2.2.2"
        ),
        .package(
            url: "https://github.com/supabase/supabase-swift.git",
            from: "2.5.1"
        ),
    ],
    targets: [
        // Targets are the basic building blocks of a package, defining a module or a test suite.
        // Targets can depend on other targets in this package and products from dependencies.
        .target(
            name: "RenderEngine",
            dependencies: [
                .product(name: "FlexLayout", package: "FlexLayout"),
                .product(name: "Supabase", package: "supabase-swift"),
            ]
        ),
        .testTarget(
            name: "RenderEngineTests",
            dependencies: ["RenderEngine"]
        ),
    ]
)
