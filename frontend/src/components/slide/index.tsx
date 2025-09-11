import { useEffect, useState } from "react";
import slide1 from "../../assets/slide_1.png"
import slide2 from "../../assets/slide_2.jpg"
import slide3 from "../../assets/slide_3.jpg"
import slide4 from "../../assets/slide_4.webp"


const image = [slide1, slide2, slide3, slide4];

const SlideQc = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [autoPlaying, setAutoPlaying] = useState(true);

    useEffect(() => {
        let interval;
        if (autoPlaying) {
            interval = setInterval(() => {
                nexSlide();
            }, 4000)
        }
        return () => clearInterval(interval);
    },[autoPlaying]);
    const nexSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % image.length);
    };

    const goToSlide = (slideIndex) => {
        setCurrentIndex(slideIndex);
    };
    const handleInageClick = () => {
        setAutoPlaying(false);
    };
    return (
    <div className="relative w-full aspect-[16/9] sm:w-[100%] sm:h-[556px] overflow-hidden mb-4">
      <div
        className="flex w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {image.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`slide-${index}`}
            onClick={handleInageClick}
            className="flex-shrink-0 object-cover w-full h-full cursor-pointer"
          />
        ))}
      </div>

      {/* Dots */}
      <div className="absolute flex space-x-2 transform -translate-x-1/2 bottom-2 left-1/2">
        {image.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? "bg-white" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
export default SlideQc;