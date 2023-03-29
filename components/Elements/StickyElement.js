import { useState, useRef, useEffect } from "react";

const StickyElement = ({ children, className, stickyClassName }) => {
  const [isSticky, setIsSticky] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const cachedRef = ref.current;
    const observer = new IntersectionObserver(
      ([e]) => setIsSticky(e.intersectionRatio < 1),
      {
        threshold: [1],
        rootMargin: "-1px 0px 0px 0px",
      }
    );

    observer.observe(cachedRef);

    return function () {
      observer.unobserve(cachedRef);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`sticky pt-5 top-0 left-0 right-0 z-20 ${className} ${
        isSticky ? stickyClassName : ""
      }`}
    >
      {children}
    </div>
  );
};

export default StickyElement;
