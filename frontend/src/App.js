import { Routes, Route } from 'react-router-dom';

import { Banner} from './components/Banner'; 
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Buy, Home, Search, Sell, View, Dashboard } from './components/routes';

import './css/App.css'; 

function App() {
  return (
    <div className="App">
      <Banner />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/search" element={<Search />}/>
        <Route path="/buy" element={<Buy />}/>
        <Route path="/sell" element={<Sell />}/>
        <Route path="/view" element={<View />}/>
        <Route path="/dashboard" element={<Dashboard />}/>
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
