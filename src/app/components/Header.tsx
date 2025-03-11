import Navbar from './Navbar';
import ToolBar from './Toolbar';

export default function Header() {
  return (
    <div className="px-4 border-b border-primary/40 md:px-6 xl:px-0 bg-secondary/40 pt-4">
      <div className=" max-w-5xl w-full mx-auto">
        <ToolBar />
        <Navbar />
      </div>
    </div>
  );
}
