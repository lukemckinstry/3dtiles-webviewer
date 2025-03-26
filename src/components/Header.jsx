import React from "react";
import { Button } from '@itwin/itwinui-react/bricks';
import { WebIO } from '@gltf-transform/core';



let Header = () => {
    const io = new WebIO();
    
    const handleClick = async () => {
        const document = await io.read('data/SanFran_Street_level_Ferry_building/0/0.glb'); // → Document
        console.log("document ", document)

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
                        <Button onClick={handleClick}> Load Tileset</Button>
                </div>
            </div>
        </>
    );
}

export default Header;