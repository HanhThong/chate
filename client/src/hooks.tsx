import React from 'react';

export const useUserName = () => {
    const [userName, setUserName] = React.useState(localStorage.getItem('userName'));

    React.useMemo(() => {
        setUserName(localStorage.getItem('userName'));
    }, []);

    const updateUserName = (newUserName: string) => {
        setUserName(newUserName);
        localStorage.setItem('userName', newUserName);
    }

    return { userName, setUserName: updateUserName };
}

export const usePrivateKeyPath = () => {
    const [privateKeyPath, setPrivateKeyPath] = React.useState(localStorage.getItem('privateKeyPath'));

    React.useMemo(() => {
        setPrivateKeyPath(localStorage.getItem('privateKeyPath'));
    }, []);

    const updatePrivateKeyPath = (newPrivateKeyPath: string) => {
        setPrivateKeyPath(privateKeyPath);
        localStorage.setItem('privateKeyPath', newPrivateKeyPath);
    }

    return { privateKeyPath, setPrivateKeyPath: updatePrivateKeyPath };
}