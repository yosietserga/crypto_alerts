import Header from './header';
import Footer from './footer';

export default function Container({ children }) {
    return (
        <div>
            <Header />
            <main>
                { children }
            </main>
            <Footer />
        </div>
    )
}