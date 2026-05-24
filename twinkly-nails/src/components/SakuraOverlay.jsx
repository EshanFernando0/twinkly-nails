import './sakura.css'; // This forces React to load the animation!

const SakuraOverlay = () => {
  // Let's drop 35 petals to make it very noticeable
  const petals = Array.from({ length: 35 }).map((_, i) => {
    // Randomize the size between 10px and 25px
    const size = Math.random() * 15 + 10; 
    
    return {
      id: i,
      left: `${Math.random() * 100}vw`,
      animationDuration: `${Math.random() * 7 + 5}s`,
      animationDelay: `${Math.random() * 5}s`,
      width: `${size}px`,
      height: `${size}px`,
    };
  });

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 9999 }}>
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="petal-shape"
          style={{
            left: petal.left,
            animationDuration: petal.animationDuration,
            animationDelay: petal.animationDelay,
            width: petal.width,
            height: petal.height,
          }}
        />
      ))}
    </div>
  );
};

export default SakuraOverlay;