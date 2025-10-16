import Image from 'next/image';
import Logo from 'public/wallaneer.svg';
import DevLinks from './DevLinks';

const Header = () => {
  return (
    <div className="w-full">
      <div className="flex flex-row items-center justify-center gap-4">
        <Image src={Logo} alt="logo" style={{ width: '180px', height: '180px' }} className="md:w-[120px] md:h-[120px]" />
        <div className="text-[4.5rem] md:text-[3.5rem] font-extrabold font-['Inter'] pt-9 md:pt-[60px]" style={{ color: '#fcbc14' }}>
          WALLANEER
        </div>
      </div>
    </div>
  );
};

export default Header;
