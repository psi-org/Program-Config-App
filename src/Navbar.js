const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>HNQIS Config App</h1>
      <div className="links">
        <a href="#">Listing</a>
        <a href="#" style={{ 
          color: 'white', 
          backgroundColor: '#f1356d',
          borderRadius: '8px' 
        }}>Settings</a>
      </div>
    </nav>
  );
}
 
export default Navbar;