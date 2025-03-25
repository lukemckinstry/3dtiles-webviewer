import React from "react";
import { Button } from '@itwin/itwinui-react';

let Header = () => {
    const handleClick = () => {
    }
    return (
        <>
            <div className="header">
                <div className="header-logo-container">
                    {"Logo"}
                </div>
                <div className="header-title-container">
                    {"Header"}
                </div>
                <div className="header-button-container">
                        <Button onClick={handleClick}> Login</Button>
                </div>
            </div>
        </>
    );
}

export default Header;