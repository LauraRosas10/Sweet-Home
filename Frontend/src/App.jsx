import React from "react";
import { BrowserRouter  } from "react-router-dom";
import { HashRouter } from "react-router-dom";

import AppRoutes from "./routes/routes.jsx";
import { ThemeProvider } from "./components/thema.jsx";
import { CartProvider } from './context/CartContext.jsx';
const App = () => {
  return (
    <HashRouter>
      <CartProvider>
      <ThemeProvider>
        <AppRoutes/>
      </ThemeProvider>
      </CartProvider>
    </HashRouter>
  );
};

export default App;