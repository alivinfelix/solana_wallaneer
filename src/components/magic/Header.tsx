import Image from 'next/image';
import Logo from 'public/favicon.ico';
import DevLinks from './DevLinks';

const Header = () => {
  return (
    <div className="app-header-container">
      <div className="flex flex-col gap-2.5 items-center">
        <Image src={Logo} alt="logo" style={{ width: '70px', height: '70px' }}/>
        <div className="text-center text-[3rem] font-extrabold font-['Inter'] leading-[30px]" style={{ color: '#e2db42' }}>
          Wallaneer
        </div>
        <div className="text-center text-base font-normal font-['SF Mono'] leading-normal" style={{ color: '#e2db42' }}>
          Demo
        </div>
      </div>
      <DevLinks />
    </div>
  );
};

export default Header;
