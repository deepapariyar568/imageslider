class ImageSlider {
    constructor(root) {
        this.root = root;

        this.track = root.querySelector(".slider-track");
        this.viewport = root.querySelector(".slider-viewport");
        this.previousButton = root.querySelector(".previous");
        this.nextButton = root.querySelector(".next");
        this.dotsContainer = root.querySelector(".slider-dots");
        this.status = root.querySelector(".slide-status");

        this.originalSlides = Array.from(this.track.children);
        this.slideCount = this.originalSlides.length;

        this.index = 1;
        this.isAnimating = false;
        this.transitionDuration = 420;

        if (this.slideCount === 0) {
            return;
        }

        // Clone boundary slides for infinite looping.
        if (this.slideCount > 1) {
            const firstClone =
                this.originalSlides[0].cloneNode(true);

            const lastClone =
                this.originalSlides[this.slideCount - 1]
                    .cloneNode(true);

            this.track.prepend(lastClone);
            this.track.append(firstClone);
        } else {
            this.index = 0;
        }

        this.slides = Array.from(this.track.children);

        this.createDots();
        this.bindEvents();
        this.setPosition(false);
        this.updateControls();

        // Handle the end of a slide transition.
        this.track.addEventListener("transitionend", (event) => {
            if (
                event.target !== this.track ||
                event.propertyName !== "transform"
            ) {
                return;
            }

            this.isAnimating = false;

            if (this.slideCount > 1) {
                // Jump from the last clone to the first real slide.
                if (this.index === this.slideCount + 1) {
                    this.index = 1;
                    this.setPosition(false);
                }

                // Jump from the first clone to the last real slide.
                else if (this.index === 0) {
                    this.index = this.slideCount;
                    this.setPosition(false);
                }
            }

            this.updateControls();
        });

        // Keep the slider aligned when the viewport changes.
        if ("ResizeObserver" in window) {
            this.resizeObserver = new ResizeObserver(() => {
                this.setPosition(false);
            });

            this.resizeObserver.observe(this.viewport);
        } else {
            window.addEventListener("resize", () => {
                this.setPosition(false);
            });
        }
    }

    // Create one dot for every original image.
    createDots() {
        this.dotsContainer.replaceChildren();

        for (let i = 0; i < this.slideCount; i++) {
            const dot = document.createElement("button");

            dot.type = "button";
            dot.className = "slider-dot";
            dot.setAttribute(
                "aria-label",
                `Go to image ${i + 1}`
            );

            dot.addEventListener("click", () => {
                this.goTo(i);
            });

            this.dotsContainer.appendChild(dot);
        }

        this.dots = Array.from(
            this.dotsContainer.children
        );
    }

    // Register arrow and keyboard controls.
    bindEvents() {
        this.previousButton.addEventListener("click", () => {
            this.move(-1);
        });

        this.nextButton.addEventListener("click", () => {
            this.move(1);
        });

        this.root.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                this.move(-1);
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                this.move(1);
            }
        });
    }

    // Calculate and apply the horizontal position.
    setPosition(animate = true) {
        this.track.style.transition = animate
            ? `transform ${this.transitionDuration}ms cubic-bezier(.22, .75, .25, 1)`
            : "none";

        this.track.style.transform =
            `translateX(-${this.index * 100}%)`;
    }

    // Move to the next or previous slide.
    move(direction) {
        if (
            this.slideCount < 2 ||
            this.isAnimating
        ) {
            return;
        }

        this.isAnimating = true;
        this.index += direction;

        this.setPosition(true);
        this.updateControls();
    }

    // Navigate directly using an indicator dot.
    goTo(targetIndex) {
        if (
            this.slideCount < 2 ||
            this.isAnimating ||
            targetIndex < 0 ||
            targetIndex >= this.slideCount
        ) {
            return;
        }

        const currentIndex =
            (this.index - 1 + this.slideCount) %
            this.slideCount;

        if (targetIndex === currentIndex) {
            return;
        }

        this.isAnimating = true;
        this.index = targetIndex + 1;

        this.setPosition(true);
        this.updateControls();
    }

    // Update active dot and image counter.
    updateControls() {
        const realIndex = this.slideCount > 0
            ? (this.index - 1 + this.slideCount) %
                this.slideCount
            : 0;

        this.dots.forEach((dot, i) => {
            const active = i === realIndex;

            dot.classList.toggle("active", active);
            dot.setAttribute(
                "aria-current",
                String(active)
            );
        });

        this.updateStatus(realIndex);
    }

    updateStatus(realIndex) {
        if (this.status && this.slideCount > 0) {
            this.status.textContent =
                `Image ${realIndex + 1} of ${this.slideCount}`;
        }
    }
}

// Initialize all sliders on the page.
document.querySelectorAll("[data-slider]").forEach((element) => {
    new ImageSlider(element);
});