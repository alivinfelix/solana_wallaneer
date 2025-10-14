import Image from 'next/image';
import Logo from 'public/favicon.ico';
import DevLinks from './DevLinks';

const Header = () => {
  return (
    <div className="w-full">
      <div className="flex flex-row items-center justify-center gap-4">
        <Image src={Logo} alt="logo" style={{ width: '80px', height: '80px' }} className="md:w-[120px] md:h-[120px]" />
        <div className="text-[2.5rem] md:text-[4.5rem] font-extrabold font-['Inter']" style={{ color: '#e2db42' }}>
          Wallaneer
        </div>
      </div>
    </div>
  );
};

export default Header;
