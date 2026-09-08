import authService from './auth.service.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email, and password are required' });
    }
    const user = await authService.register({ name, email, password, role });
    res.status(201).json({ success: true, message: 'Account created successfully', data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }
    const result = await authService.login({ email, password });
    res.json({ success: true, message: 'Login successful', data: result });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.userId);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export default { register, login, getProfile };
