import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
} from "framer-motion";
import { useEffect, useState } from "react";

/* ============================================================
   BOOK CARD
============================================================ */

function BookCard({
  item,
  index,
  totalItems,
  angleStep,
  radius,
  cardWidth,
  cardHeight,
  smoothRotation,
  viewportWidth,
  isDragging,
  goTo,
}) {
  /*
   * CENTER CARD = 0 DEG
   */
  const baseAngle = (index - Math.floor(totalItems / 2)) * angleStep;

  const angle = useTransform(
    smoothRotation,
    (rotation) => baseAngle + (rotation * Math.PI) / 180,
  );

  /* ============================================================
     HORIZONTAL CURVE
  ============================================================ */

  const x = useTransform(angle, (a) => Math.sin(a) * radius);

  /* ============================================================
     DEPTH
  ============================================================ */

  const depth = useTransform(angle, (a) => Math.cos(a));

  const z = useTransform(depth, (d) => d * 220);

  /* ============================================================
     FRONT FACTOR
  ============================================================ */

  const frontFactor = useTransform(depth, (d) =>
    Math.max(0, Math.min(1, (d + 0.1) / 1.1)),
  );

  /* ============================================================
     SCALE
  ============================================================ */

  const scale = useTransform(frontFactor, (f) => 0.72 + f * 0.28);

  /* ============================================================
     VERTICAL CURVE
  ============================================================ */

  const y = useTransform(depth, (d) => {
    const curve = 1 - Math.max(0, d);

    return curve * 55;
  });

  /* ============================================================
     ROTATION
  ============================================================ */

  const rotateY = useTransform(angle, (a) => {
    const degrees = (a * 180) / Math.PI;

    return Math.max(-48, Math.min(48, -degrees * 0.62));
  });

  /* ============================================================
     SUBTLE VERTICAL TILT
  ============================================================ */

  const rotateX = useTransform(depth, (d) => {
    const curve = 1 - Math.max(0, d);

    return curve * 2.5;
  });

  /* ============================================================
     OPACITY
  ============================================================ */

  const opacity = useTransform(frontFactor, (f) => 0.65 + f * 0.35);

  /* ============================================================
     IMAGE BRIGHTNESS
  ============================================================ */

  const brightness = useTransform(frontFactor, (f) => 0.68 + f * 0.32);

  const saturation = useTransform(frontFactor, (f) => 0.8 + f * 0.2);

  const filter = useTransform(
    [brightness, saturation],
    ([b, s]) => `brightness(${b}) saturate(${s})`,
  );

  /* ============================================================
     Z INDEX
  ============================================================ */

  const zIndex = useTransform(frontFactor, (f) => Math.round(10 + f * 500));

  /* ============================================================
     SHADOW
  ============================================================ */

  const boxShadow = useTransform(frontFactor, (f) => {
    const color = item.color || "#ffffff";

    return `
        0 30px 70px rgba(0,0,0,0.55),
        0 10px 30px ${color}22,
        inset 0 1px 0 rgba(255,255,255,0.18)
      `;
  });

  const isCenter = index === Math.floor(totalItems / 2);

  return (
    <motion.div
      onClick={() => {
        if (!isDragging) {
          goTo(index);
        }
      }}
      initial={{
        opacity: 0,
        scale: 0.7,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.45,
      }}
      style={{
        position: "absolute",

        /*
         * EXACT CENTER
         */
        left: "50%",
        top: "50%",

        width: cardWidth,
        height: cardHeight,

        marginLeft: -cardWidth / 2,

        marginTop: -cardHeight / 2,

        /*
         * 3D POSITION
         */
        x,
        y,
        z,

        /*
         * 3D ROTATION
         */
        rotateY,
        rotateX,

        /*
         * SCALE
         */
        scale,

        opacity,

        zIndex,

        transformStyle: "preserve-3d",

        transformOrigin: "center center",

        cursor: isCenter ? "default" : "pointer",

        willChange: "transform, opacity",
      }}
    >
      {/* ======================================================
          BOOK CARD
      ====================================================== */}

      <motion.div
        style={{
          position: "relative",

          width: "100%",
          height: "100%",

          overflow: "hidden",

          borderRadius: viewportWidth < 600 ? "11px" : "15px",

          background: "#111",

          border: "1px solid rgba(255,255,255,0.17)",

          boxShadow,

          filter,

          transformStyle: "preserve-3d",
        }}
      >
        {/* ====================================================
            IMAGE
        ==================================================== */}

        <img
          src={item.image}
          alt={item.label || "Travel"}
          draggable={false}
          style={{
            position: "absolute",

            inset: 0,

            width: "100%",
            height: "100%",

            objectFit: "cover",

            objectPosition: "center",

            display: "block",

            userSelect: "none",

            pointerEvents: "none",
          }}
        />

        {/* ====================================================
            DARK IMAGE GRADIENT
        ==================================================== */}

        <div
          style={{
            position: "absolute",

            inset: 0,

            background: `
              linear-gradient(
                180deg,
                rgba(0,0,0,0.03) 0%,
                transparent 40%,
                rgba(0,0,0,0.85) 100%
              )
            `,

            pointerEvents: "none",
          }}
        />

        {/* ====================================================
            TOP REFLECTION
        ==================================================== */}

        <div
          style={{
            position: "absolute",

            inset: 0,

            background:
              "linear-gradient(135deg, rgba(255,255,255,0.14), transparent 25%)",

            pointerEvents: "none",
          }}
        />

        {/* ====================================================
            BOOK SPINE
        ==================================================== */}

        <div
          style={{
            position: "absolute",

            left: 0,
            top: 0,
            bottom: 0,

            width: "4px",

            background:
              "linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0.03))",

            opacity: 0.6,

            pointerEvents: "none",
          }}
        />

        {/* ====================================================
            GLASS LABEL
        ==================================================== */}

        <div
          style={{
            position: "absolute",

            left: 8,
            right: 8,
            bottom: 10,

            display: "flex",

            justifyContent: "center",

            pointerEvents: "none",
          }}
        >
          <span
            style={{
              color: "#ffffff",

              fontSize: viewportWidth < 600 ? "10px" : "13px",

              fontWeight: 600,

              padding: "7px 11px",

              borderRadius: "9px",

              background: "rgba(0,0,0,0.42)",

              backdropFilter: "blur(11px)",

              WebkitBackdropFilter: "blur(11px)",

              border: "1px solid rgba(255,255,255,0.18)",

              whiteSpace: "nowrap",

              overflow: "hidden",

              textOverflow: "ellipsis",

              maxWidth: "94%",

              textShadow: "0 2px 8px rgba(0,0,0,0.9)",
            }}
          >
            {item.label}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   MAIN CAROUSEL
============================================================ */

function ArcCarousel({ items = [] }) {
  if (!items.length) {
    return null;
  }

  /* ==========================================================
     STATE
  ========================================================== */

  const initialIndex = Math.floor(items.length / 2);

  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const [isDragging, setIsDragging] = useState(false);

  /* ==========================================================
     ROTATION
  ========================================================== */

  const rotation = useMotionValue(0);

  const smoothRotation = useSpring(rotation, {
    stiffness: 75,
    damping: 19,
    mass: 0.8,
  });

  /* ==========================================================
     VIEWPORT
  ========================================================== */

  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1440,
  );

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /* ==========================================================
     CARD SIZE
  ========================================================== */

  const cardWidth =
    viewportWidth < 480
      ? 135
      : viewportWidth < 768
        ? 150
        : viewportWidth < 1200
          ? 175
          : 205;

  const cardHeight =
    viewportWidth < 480
      ? 200
      : viewportWidth < 768
        ? 225
        : viewportWidth < 1200
          ? 270
          : 310;

  /* ==========================================================
     CYLINDER RADIUS

     Slightly increased so the carousel still covers
     the complete website width after reducing the angle.
  ========================================================== */

  const radius =
    viewportWidth < 480
      ? 250
      : viewportWidth < 768
        ? 390
        : viewportWidth < 1200
          ? 650
          : 920;

  /* ==========================================================
     REDUCED SPACE BETWEEN CARDS

     Previous:
       Desktop = 155 degrees

     Now:
       Desktop = 132 degrees

     This brings neighboring cards closer together while
     the larger radius keeps the overall carousel wide.
  ========================================================== */

  const visibleArc =
    viewportWidth < 600 ? 105 : viewportWidth < 1200 ? 100 : 100;

  const angleStep =
    items.length > 1 ? (visibleArc / (items.length - 1)) * (Math.PI / 180) : 0;

  /* ==========================================================
     MOUSE MOVE
  ========================================================== */

  const handleMouseMove = (e) => {
    if (isDragging) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;

    const normalized = mouseX / rect.width;

    const centered = normalized * 2 - 1;

    /*
     * Full website-width movement.
     */
    const targetRotation = centered * 65;

    rotation.set(targetRotation);
  };

  /* ==========================================================
     MOUSE LEAVE
  ========================================================== */

  const handleMouseLeave = () => {
    if (!isDragging) {
      animate(rotation, 0, {
        type: "spring",
        stiffness: 75,
        damping: 19,
        mass: 0.8,
      });
    }
  };

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const goTo = (index) => {
    const nextIndex = Math.max(0, Math.min(index, items.length - 1));

    setActiveIndex(nextIndex);

    const offset = nextIndex - initialIndex;

    const targetRotation = (-offset * (angleStep * 180)) / Math.PI;

    animate(rotation, targetRotation, {
      type: "spring",
      stiffness: 100,
      damping: 22,
      mass: 0.8,
    });
  };

  const next = () => {
    if (activeIndex < items.length - 1) {
      goTo(activeIndex + 1);
    }
  };

  const previous = () => {
    if (activeIndex > 0) {
      goTo(activeIndex - 1);
    }
  };

  /* ==========================================================
     DRAG
  ========================================================== */

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (_, info) => {
    rotation.set(info.offset.x * 0.22);
  };

  const handleDragEnd = (_, info) => {
    setIsDragging(false);

    const offset = info.offset.x;

    const velocity = info.velocity.x;

    const swipePower = Math.abs(offset) * 0.5 + Math.abs(velocity) * 0.15;

    if (swipePower > 80) {
      if (offset < 0) {
        next();
      } else {
        previous();
      }
    } else {
      const selectedOffset = activeIndex - initialIndex;

      const targetRotation = (-selectedOffset * (angleStep * 180)) / Math.PI;

      animate(rotation, targetRotation, {
        type: "spring",
        stiffness: 100,
        damping: 22,
        mass: 0.8,
      });
    }
  };

  /* ==========================================================
     WHEEL
  ========================================================== */

  const handleWheel = (e) => {
    if (Math.abs(e.deltaY) < 20 && Math.abs(e.deltaX) < 20) {
      return;
    }

    if (e.deltaY > 0 || e.deltaX > 0) {
      next();
    } else {
      previous();
    }
  };

  /* ==========================================================
     KEYBOARD
  ========================================================== */

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        next();
      }

      if (e.key === "ArrowLeft") {
        previous();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, items.length]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      style={{
        position: "relative",

        /*
         * TRUE FULL WIDTH
         */
        width: "100vw",

        marginLeft: "calc(50% - 50vw)",

        height: viewportWidth < 600 ? 360 : 430,

        /*
         * 3D PERSPECTIVE
         */
        perspective: "1600px",

        perspectiveOrigin: "50% 48%",

        overflow: "hidden",

        touchAction: "pan-y",

        userSelect: "none",

        /*
         * NO BACKGROUND
         */
        background: "transparent",
      }}
    >
      {/* ======================================================
          CAROUSEL STAGE
      ====================================================== */}

      <motion.div
        drag="x"
        dragConstraints={{
          left: -220,
          right: 220,
        }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{
          position: "absolute",

          inset: 0,

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          transformStyle: "preserve-3d",

          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        {/* ==================================================
            EXACT 3D CENTER
        ================================================== */}

        <div
          style={{
            position: "absolute",

            left: "50%",
            top: "50%",

            width: 0,
            height: 0,

            transform: "translate3d(0,0,0)",

            transformStyle: "preserve-3d",
          }}
        >
          {items.map((item, index) => (
            <BookCard
              key={item.id || item.label || index}
              item={item}
              index={index}
              totalItems={items.length}
              angleStep={angleStep}
              radius={radius}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              smoothRotation={smoothRotation}
              viewportWidth={viewportWidth}
              isDragging={isDragging}
              goTo={goTo}
            />
          ))}
        </div>
      </motion.div>

      {/* ======================================================
          NAVIGATION
      ====================================================== */}

      {viewportWidth >= 700 && (
        <>
          {/* LEFT BUTTON */}

          <button
            onClick={previous}
            disabled={activeIndex === 0}
            aria-label="Previous"
            style={{
              position: "absolute",

              left: 16,
              top: "50%",

              transform: "translateY(-50%)",

              width: 44,
              height: 44,

              borderRadius: "50%",

              border: "1px solid rgba(255,255,255,0.22)",

              background: "rgba(0,0,0,0.45)",

              color: "#fff",

              fontSize: "26px",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              cursor: activeIndex === 0 ? "default" : "pointer",

              opacity: activeIndex === 0 ? 0.25 : 0.85,

              zIndex: 1000,

              backdropFilter: "blur(8px)",

              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            ‹
          </button>

          {/* RIGHT BUTTON */}

          <button
            onClick={next}
            disabled={activeIndex === items.length - 1}
            aria-label="Next"
            style={{
              position: "absolute",

              right: 16,
              top: "50%",

              transform: "translateY(-50%)",

              width: 44,
              height: 44,

              borderRadius: "50%",

              border: "1px solid rgba(255,255,255,0.22)",

              background: "rgba(0,0,0,0.45)",

              color: "#fff",

              fontSize: "26px",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              cursor: activeIndex === items.length - 1 ? "default" : "pointer",

              opacity: activeIndex === items.length - 1 ? 0.25 : 0.85,

              zIndex: 1000,

              backdropFilter: "blur(8px)",

              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            ›
          </button>
        </>
      )}
    </section>
  );
}

export default ArcCarousel;