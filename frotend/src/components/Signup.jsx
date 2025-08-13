// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import '../assets/css/Auth.css';

// const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

// const Signup = () => {
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     agreeToTerms: false
//   });

//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/register/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           first_name: formData.firstName,
//           last_name: formData.lastName,
//           email: formData.email,
//           password: formData.password,
//           confirm_password: formData.confirmPassword,
//           agree_to_terms: formData.agreeToTerms
//         }),
//       });

//       const data = await response.json();
      
//       if (response.ok) {
//         alert('Account created successfully!');
//         console.log('Success:', data);
//         // Redirect or clear form
//       } else {
//         console.error('Error:', data);
//         alert('Error: ' + JSON.stringify(data));
//       }
//     } catch (error) {
//       console.error('Request failed:', error);
//       alert('Network error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         <div className="auth-header">
//           <h1>Join thousands of users managing expenses together</h1>
//         </div>

//         <form onSubmit={handleSubmit} className="auth-form">
//           <div className="form-row">
//             <div className="form-group">
//               <input
//                 type="text"
//                 name="firstName"
//                 placeholder="First Name"
//                 value={formData.firstName}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="form-group">
//               <input
//                 type="text"
//                 name="lastName"
//                 placeholder="Last Name"
//                 value={formData.lastName}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//           </div>

//           <div className="form-group">
//             <input
//               type="email"
//               name="email"
//               placeholder="Email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <input
//               type="password"
//               name="confirmPassword"
//               placeholder="Confirm Password"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="form-group checkbox-group">
//             <label className="checkbox-label">
//               <input
//                 type="checkbox"
//                 name="agreeToTerms"
//                 checked={formData.agreeToTerms}
//                 onChange={handleChange}
//                 required
//               />
//               <span className="checkmark"></span>
//               I agree to the Terms and Conditions
//             </label>
//           </div>

//           <button 
//             type="submit" 
//             className="btn auth-btn"
//             disabled={loading}
//           >
//             {loading ? 'Creating Account...' : 'Create Your Account'}
//           </button>
//         </form>

//         <div className="auth-footer">
//           <p>
//             Already have an account?{' '}
//             <Link to="/login">Sign in</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Signup;



// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import '../assets/css/Auth.css';

// const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

// const Signup = () => {
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     agreeToTerms: false
//   });

//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));

//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.firstName.trim()) {
//       newErrors.firstName = 'First name is required';
//     }

//     if (!formData.lastName.trim()) {
//       newErrors.lastName = 'Last name is required';
//     }

//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Email is invalid';
//     }

//     if (!formData.password) {
//       newErrors.password = 'Password is required';
//     } else if (formData.password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//     }

//     if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//     }

//     if (!formData.agreeToTerms) {
//       newErrors.agreeToTerms = 'You must agree to the terms and conditions';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) return;

//     setLoading(true);
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/register/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           first_name: formData.firstName,
//           last_name: formData.lastName,
//           email: formData.email,
//           password: formData.password,
//           confirm_password: formData.confirmPassword,
//           agree_to_terms: formData.agreeToTerms
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         localStorage.setItem('access_token', data.tokens.access);
//         localStorage.setItem('refresh_token', data.tokens.refresh);
//         localStorage.setItem('user', JSON.stringify(data.user));
        
//         alert('Account created successfully!');
//         window.location.href = '/dashboard';
//       } else {
//         const newErrors = {};
        
//         if (data.email) {
//           newErrors.email = Array.isArray(data.email) ? data.email[0] : data.email;
//         }
//         if (data.password) {
//           newErrors.password = Array.isArray(data.password) ? data.password[0] : data.password;
//         }
//         if (data.non_field_errors) {
//           alert(Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors);
//         }
        
//         setErrors(prevErrors => ({ ...prevErrors, ...newErrors }));
//       }
//     } catch (error) {
//       console.error('Registration error:', error);
//       alert('Something went wrong. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleSignup = () => {
//     console.log('Google signup clicked');
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         <div className="auth-header">
//           <h2>Join thousands of users managing expenses together</h2>
//           <p>Create your account to start splitting expenses with friends and family</p>
//         </div>

//         <form onSubmit={handleSubmit} className="auth-form">
//           <div className="form-row">
//             <div className="form-group">
//               <label htmlFor="firstName">First Name</label>
//               <input
//                 type="text"
//                 id="firstName"
//                 name="firstName"
//                 placeholder="Enter your first name"
//                 value={formData.firstName}
//                 onChange={handleChange}
//                 className={errors.firstName ? 'error' : ''}
//                 disabled={loading}
//                 required
//               />
//               {errors.firstName && <span className="error-message">{errors.firstName}</span>}
//             </div>
            
//             <div className="form-group">
//               <label htmlFor="lastName">Last Name</label>
//               <input
//                 type="text"
//                 id="lastName"
//                 name="lastName"
//                 placeholder="Enter your last name"
//                 value={formData.lastName}
//                 onChange={handleChange}
//                 className={errors.lastName ? 'error' : ''}
//                 disabled={loading}
//                 required
//               />
//               {errors.lastName && <span className="error-message">{errors.lastName}</span>}
//             </div>
//           </div>

//           <div className="form-group">
//             <label htmlFor="email">Email Address</label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               placeholder="Enter your email address"
//               value={formData.email}
//               onChange={handleChange}
//               className={errors.email ? 'error' : ''}
//               disabled={loading}
//               required
//             />
//             {errors.email && <span className="error-message">{errors.email}</span>}
//           </div>

//           <div className="form-group">
//             <label htmlFor="password">Password</label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               placeholder="Create a strong password"
//               value={formData.password}
//               onChange={handleChange}
//               className={errors.password ? 'error' : ''}
//               disabled={loading}
//               required
//             />
//             {errors.password && <span className="error-message">{errors.password}</span>}
//           </div>

//           <div className="form-group">
//             <label htmlFor="confirmPassword">Confirm Password</label>
//             <input
//               type="password"
//               id="confirmPassword"
//               name="confirmPassword"
//               placeholder="Confirm your password"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               className={errors.confirmPassword ? 'error' : ''}
//               disabled={loading}
//               required
//             />
//             {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
//           </div>

//           <div className="form-options">
//             <label className="checkbox-label">
//               <input
//                 type="checkbox"
//                 name="agreeToTerms"
//                 checked={formData.agreeToTerms}
//                 onChange={handleChange}
//                 disabled={loading}
//               />
//               <span className="checkmark"></span>
//               I agree to the <a href="#terms" className="auth-link">Terms and Conditions</a> and <a href="#privacy" className="auth-link">Privacy Policy</a>
//             </label>
//             {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
//           </div>

//           <button 
//             type="submit" 
//             className="btn auth-btn"
//             disabled={loading}
//           >
//             {loading ? 'Creating Account...' : 'Create Your Account'}
//           </button>
//         </form>

//         <div className="divider">
//           <span>or continue with</span>
//         </div>

//         <button 
//           onClick={handleGoogleSignup} 
//           className="btn btn-google"
//           disabled={loading}
//         >
//           <svg className="google-icon" viewBox="0 0 24 24">
//             <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//             <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//             <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//             <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//           </svg>
//           Continue with Google
//         </button>

//         <div className="auth-footer">
//           <p>
//             Already have an account?{' '}
//             <Link to="/login" className="auth-link">Sign in to your account</Link>
//           </p>
//         </div>
//       </div>
      
//       <div className="auth-back">
//         <Link to="/">← Back to Home</Link>
//       </div>
//     </div>
//   );
// };

// export default Signup;


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/Auth.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          agree_to_terms: formData.agreeToTerms
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        alert('Account created successfully!');
        window.location.href = '/dashboard';
      } else {
        const newErrors = {};
        
        if (data.email) {
          newErrors.email = Array.isArray(data.email) ? data.email[0] : data.email;
        }
        if (data.password) {
          newErrors.password = Array.isArray(data.password) ? data.password[0] : data.password;
        }
        if (data.non_field_errors) {
          alert(Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors);
        }
        
        setErrors(prevErrors => ({ ...prevErrors, ...newErrors }));
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    console.log('Google signup clicked');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          {/* Icons arranged horizontally - same as login page */}
          <div className="expense-icons horizontal">
            <div className="icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div className="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                <path d="M13 12h3"/>
                <path d="M5 12h3"/>
              </svg>
            </div>
            <div className="icon-wrapper">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="icon-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10,17 15,12 10,7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </div>
          </div>
          
          <div className="brand-badge">
            <span className="brand-icon">💰</span>
            <span className="brand-text">PayWise</span>
          </div>
          
          <h2>Join thousands of users managing expenses together</h2>
          <p>Create your account to start splitting expenses with friends and family</p>
          
          <div className="features-highlight">
            <div className="feature-item">
              <span className="feature-icon">✨</span>
              <span>Easy Splitting</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🤝</span>
              <span>Group Management</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Smart Tracking</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? 'error' : ''}
                disabled={loading}
                required
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? 'error' : ''}
                disabled={loading}
                required
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              disabled={loading}
              required
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              disabled={loading}
              required
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              disabled={loading}
              required
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                disabled={loading}
              />
              <span className="checkmark"></span>
              I agree to the <a href="#terms" className="auth-link">Terms and Conditions</a> and <a href="#privacy" className="auth-link">Privacy Policy</a>
            </label>
            {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
          </div>

          <button 
            type="submit" 
            className="btn auth-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Your Account'}
          </button>
        </form>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <button 
          onClick={handleGoogleSignup} 
          className="btn btn-google"
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* FIXED: Changed "Sign in" to "Login" */}
        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Login here</Link>
          </p>
        </div>
      </div>
      
      <div className="auth-back">
        <Link to="/">← Back to Home</Link>
      </div>
    </div>
  );
};

export default Signup;
