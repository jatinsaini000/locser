import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import ServiceDetails from './pages/ServiceDetails';
import BookingFlow from './pages/BookingFlow';
import Bookings from './pages/Bookings';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import MyListings from './pages/MyListings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Earnings from './pages/Earnings';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="search" element={<Search />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="listings" element={<MyListings />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<Profile />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="service/:id" element={<ServiceDetails />} />
          <Route path="booking/:id" element={<BookingFlow />} />
        </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
