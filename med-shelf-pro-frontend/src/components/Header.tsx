import { Package } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-pharmacy-primary" />
              <div>
                <span className="text-2xl font-bold text-pharmacy-primary">Gama</span>
                <span className="text-2xl font-bold text-foreground ml-1">Storage</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">Gerenciador para farmácia</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;