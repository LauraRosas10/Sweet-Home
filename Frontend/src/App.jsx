import React from "react";
import { BrowserRouter  } from "react-router-dom";
import AppRoutes from "./routes/routes.jsx";
import { ThemeProvider } from "./components/thema.jsx";
import { CartProvider } from './context/CartContext.jsx';
const App = () => {
  return (
    <BrowserRouter>
      <CartProvider>
      <ThemeProvider>
        <AppRoutes/>
      </ThemeProvider>
      </CartProvider>
    </BrowserRouter>
  );
};

export default App;