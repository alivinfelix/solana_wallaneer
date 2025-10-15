import React from 'react';

const BackgroundDecorations: React.FC = () => {
  return (
    <>
      {/* Top Right Border */}
      <div 
        className="fixed top-0 right-0 w-[250px] h-[250px] bg-[#e2db42] rounded-bl-[100px] pointer-events-none md:w-[250px] md:h-[250px] sm:w-[120px] sm:h-[120px]"
        style={{ backgroundColor: '#e2db42' }} // Using the yellow color from your Wallaneer logo
      />
      
      {/* Bottom Left Border */}
      <div 
        className="fixed bottom-0 left-0 w-[250px] h-[250px] bg-[#e2db42] rounded-tr-[100px] pointer-events-none border-l-[3px] border-[#e2db42] md:w-[250px] md:h-[250px] sm:w-[150px] sm:h-[150px]"
        style={{ backgroundColor: '#e2db42' }} // Using the yellow color from your Wallaneer logo
      />
    </>
  );
};

export default BackgroundDecorations;
