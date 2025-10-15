import React, { ReactNode } from 'react';
import Image from 'next/image';
import styles from '@/styles/PhoneFrame.module.css';

interface PhoneFrameProps {
  children: ReactNode;
}

const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="relative flex justify-center">
      {/* Content that goes inside the phone screen */}
      <div className={`absolute z-110 top-[9%] left-[50%] transform -translate-x-1/2 w-[90%] max-w-[500px] max-h-[82%] ${styles.phoneContent}`}>
        {children}
      </div>
      
      {/* Phone image */}
      <div className="relative w-[800px] md:w-[900px] z-5 pointer-events-none">
        <Image 
          src="/phone.png" 
          alt="Phone frame" 
          width={800} 
          height={1200} 
          className="w-full h-auto"
          priority
        />
      </div>
    </div>
  );
};

export default PhoneFrame;
