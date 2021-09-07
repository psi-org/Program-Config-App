import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav>
            <Link to="/" ><button>Home</button></Link>
        </nav>
    );
}

export default Navbar;