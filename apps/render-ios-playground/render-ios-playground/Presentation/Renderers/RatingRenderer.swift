import UIKit

class RatingRenderer: Renderer {
    let type = "Rating"

    func render(component: Component) -> UIView? {
        return RenderableRating(component: component)
    }
}

class RenderableRating: UIView, Renderable {
    let component: Component
    private var starViews: [UIImageView] = []
    private var currentRating = 0.0
    private var maxRating = 5
    private var isInteractive = false
    private let starSize: CGFloat = 16

    init(component: Component) {
        self.component = component
        super.init(frame: .zero)
        applyStyle()
        applyFlexStyles()
        setupRating()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private func setupRating() {
        // Get properties
        currentRating = component.properties.getDouble(forKey: "rating") ?? 0.0
        maxRating = component.properties.getInt(forKey: "maxRating") ?? 5
        isInteractive = component.properties.getBool(forKey: "interactive") ?? false

        // Create star views
        for i in 0..<maxRating {
            let starView = UIImageView()
            starView.contentMode = .scaleAspectFit
            starView.isUserInteractionEnabled = false
            starViews.append(starView)
            addSubview(starView)

            starView.translatesAutoresizingMaskIntoConstraints = false
            NSLayoutConstraint.activate([
                starView.centerYAnchor.constraint(equalTo: centerYAnchor),
                starView.widthAnchor.constraint(equalToConstant: starSize),
                starView.heightAnchor.constraint(equalToConstant: starSize)
            ])

            if i == 0 {
                starView.leadingAnchor.constraint(equalTo: leadingAnchor).isActive = true
            } else {
                starView.leadingAnchor.constraint(equalTo: starViews[i-1].trailingAnchor, constant: 2).isActive = true
            }
        }

        // Add tap gesture if interactive
        if isInteractive {
            let tapGesture = UITapGestureRecognizer(target: self, action: #selector(ratingTapped(_:)))
            addGestureRecognizer(tapGesture)
        }

        updateStars()
    }

    private func updateStars() {
        for (index, starView) in starViews.enumerated() {
            let starRating = Double(index + 1)
            if starRating <= currentRating {
                starView.image = createFilledStar()
                starView.tintColor = UIColor.systemYellow
            } else if starRating - 0.5 <= currentRating {
                starView.image = createHalfStar()
                starView.tintColor = UIColor.systemYellow
            } else {
                starView.image = createEmptyStar()
                starView.tintColor = UIColor.systemGray
            }
        }
    }

    @objc private func ratingTapped(_ gesture: UITapGestureRecognizer) {
        guard isInteractive else { return }

        let location = gesture.location(in: self)
        let starIndex = Int(location.x / (starSize + 2))

        if starIndex >= 0 && starIndex < maxRating {
            currentRating = Double(starIndex + 1)
            updateStars()
        }
    }

    private func createFilledStar() -> UIImage? {
        let starPath = UIBezierPath()
        let center = CGPoint(x: starSize/2, y: starSize/2)

        // Create a simple star shape
        for i in 0..<5 {
            let angle = Double(i) * Double.pi * 2 / 5 - Double.pi / 2
            let x = center.x + cos(angle) * (starSize/2 * 0.4)
            let y = center.y + sin(angle) * (starSize/2 * 0.4)

            if i == 0 {
                starPath.move(to: CGPoint(x: x, y: y))
            } else {
                starPath.addLine(to: CGPoint(x: x, y: y))
            }
        }
        starPath.close()

        // Create image from path
        let size = CGSize(width: starSize, height: starSize)
        UIGraphicsBeginImageContextWithOptions(size, false, 0)
        defer { UIGraphicsEndImageContext() }

        let context = UIGraphicsGetCurrentContext()!
        context.addPath(starPath.cgPath)
        context.setFillColor(UIColor.systemYellow.cgColor)
        context.fillPath()

        return UIGraphicsGetImageFromCurrentImageContext()
    }

    private func createHalfStar() -> UIImage? {
        let starPath = UIBezierPath()
        let center = CGPoint(x: starSize/2, y: starSize/2)

        // Create a simple star shape
        for i in 0..<5 {
            let angle = Double(i) * Double.pi * 2 / 5 - Double.pi / 2
            let x = center.x + cos(angle) * (starSize/2 * 0.4)
            let y = center.y + sin(angle) * (starSize/2 * 0.4)

            if i == 0 {
                starPath.move(to: CGPoint(x: x, y: y))
            } else {
                starPath.addLine(to: CGPoint(x: x, y: y))
            }
        }
        starPath.close()

        // Create image from path
        let size = CGSize(width: starSize, height: starSize)
        UIGraphicsBeginImageContextWithOptions(size, false, 0)
        defer { UIGraphicsEndImageContext() }

        let context = UIGraphicsGetCurrentContext()!
        context.addPath(starPath.cgPath)
        context.setFillColor(UIColor.systemYellow.withAlphaComponent(0.5).cgColor)
        context.fillPath()

        return UIGraphicsGetImageFromCurrentImageContext()
    }

    private func createEmptyStar() -> UIImage? {
        let starPath = UIBezierPath()
        let center = CGPoint(x: starSize/2, y: starSize/2)

        // Create a simple star shape
        for i in 0..<5 {
            let angle = Double(i) * Double.pi * 2 / 5 - Double.pi / 2
            let x = center.x + cos(angle) * (starSize/2 * 0.4)
            let y = center.y + sin(angle) * (starSize/2 * 0.4)

            if i == 0 {
                starPath.move(to: CGPoint(x: x, y: y))
            } else {
                starPath.addLine(to: CGPoint(x: x, y: y))
            }
        }
        starPath.close()

        // Create image from path
        let size = CGSize(width: starSize, height: starSize)
        UIGraphicsBeginImageContextWithOptions(size, false, 0)
        defer { UIGraphicsEndImageContext() }

        let context = UIGraphicsGetCurrentContext()!
        context.addPath(starPath.cgPath)
        context.setStrokeColor(UIColor.systemGray.cgColor)
        context.setLineWidth(1)
        context.strokePath()

        return UIGraphicsGetImageFromCurrentImageContext()
    }

    private func applyStyle() {
        applyVisualStyles()
        // Additional styling can be added here
    }
}
