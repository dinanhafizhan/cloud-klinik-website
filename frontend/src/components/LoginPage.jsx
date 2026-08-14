import React, { useState } from 'react';
import '../LoginPage.css'; // Ensure this CSS file exists in the parent directory
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../utils/auth'; // Import the login function (assuming its path)
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
  // State variables for managing UI and form inputs
  const [isLogin, setIsLogin] = useState(true); // Toggles between Login and Register views
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Registration form specific states
  const [nama, setNama] = useState('');
  const [gender, setGender] = useState('Laki-laki'); // Default value for gender dropdown
  const [alamat, setAlamat] = useState('');
  const [noTlp, setNoTlp] = useState(''); // Note: backend expects 'no_tlp'
  const [errorMsg, setErrorMsg] = useState(''); // State for displaying error messages

  // Hooks for navigation and getting current location state
  const navigate = useNavigate();
  const location = useLocation();

  // Framer Motion variants for container animation
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  // Handler for login form submission
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setErrorMsg(''); // Clear any previous error messages

    try {
      // 1. Send login request to the backend
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, { email, password });
      const { token } = res.data; // Extract the authentication token

      // 2. Fetch user details (including role and userId) using the obtained token
      const meRes = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` } // Send token in Authorization header
      });

      const { id: userId, role } = meRes.data; // Extract userId and role

      // 3. Store login information (userId, token, role) using the utility function
      login(userId, token, role); // Assuming 'login' handles storing to localStorage/context

      // 4. Redirect user based on their role
      if (role === "admin") {
        navigate("/admin"); // Redirect admin users to /admin dashboard
      } else {
        // Redirect regular users to their intended page or default reservation page
        const redirectTo = location.state?.from || "/reservasi";
        navigate(redirectTo);
      }

    } catch (error) {
      // Handle login errors
      console.error("Login error:", error);
      const msg = error?.response?.data?.msg || "Email atau Password salah. Silakan coba lagi.";
      setErrorMsg(msg);
    }
  };

  // Handler for registration form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validasi email
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg("Format email tidak valid.");
      toast.error("❌ Format email tidak valid.");
      return;
    }

    try {
      // Perform registration
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/Register`, {
        nama,
        email,
        password,
        gender,
        alamat,
        no_tlp: noTlp
      });

      toast.success("🎉 Registrasi berhasil! Silakan login.");

      setIsLogin(true);
      setEmail('');
      setPassword('');
      setNama('');
      setGender('Laki-laki'); // Reset
      setAlamat('');
      setNoTlp('');
    } catch (error) {
      console.error("Registration error!", error);
      const msg = error?.response?.data?.msg || "Registrasi gagal.";
      setErrorMsg(msg);
      toast.error(`❌ ${msg}`);
    }
  };



  return (
    <div className="login-register-container">
      <motion.div className="form-container" variants={containerVariants} initial="hidden" animate="visible">
        {/* Section to switch between Login and Register */}
        <div className="switch-section">
          <h2>{isLogin ? "Selamat Datang Kembali" : "Daftar Akun Baru"}</h2>
          <p>{isLogin ? "Silakan login untuk melanjutkan ke layanan kami." : "Lengkapi form di samping untuk membuat akun baru dan nikmati fitur lengkap kami."}</p>
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Belum Punya Akun? Daftar" : "Sudah Punya Akun? Login"}
          </button>
        </div>

        {/* Section for Login/Register Form */}
        <motion.div
          className="form-section"
          // Use key to force re-render/animation when switching forms
          key={isLogin ? "login" : "register"}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
        >
          {isLogin ? (
            // Login Form
            <form className="form" onSubmit={handleLogin}>
              <h3>Login</h3>
              {errorMsg && <p className="error-msg">{errorMsg}</p>}
              <input
                type="email"
                placeholder="Email Anda"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Kata Sandi"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="submit">Login</button>
            </form>
          ) : (
            // Register Form
            <form className="form" onSubmit={handleRegister}>
              <h3>Daftar</h3>
              {errorMsg && <p className="error-msg">{errorMsg}</p>}

              <input
                type="text"
                placeholder="Nama Lengkap"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="Email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Buat Kata Sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* Gender Dropdown */}
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="form-field"
                required
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>

              <input
                type="text"
                placeholder="Alamat Lengkap"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
              />

              <input
                type="tel"
                placeholder="Nomor Telepon (contoh: 081234567890)"
                value={noTlp}
                onChange={(e) => setNoTlp(e.target.value)}
              />

              <button type="submit">Daftar</button>
            </form>

          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;