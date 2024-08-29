document.addEventListener('DOMContentLoaded', function() {
    console.log('gtag:', typeof gtag); 

    const registroForm = document.getElementById('register-form');
    
    if (registroForm) {
        registroForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const familyName = document.getElementById('family-name').value.trim();
            const password = document.getElementById('password').value.trim();
            const username = document.getElementById('username').value.trim();

            try {
                const response = await fetch(window.config.COGNITO_AUTH_URL, { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-amz-json-1.1',
                        'X-Amz-Target': 'AWSCognitoIdentityProviderService.SignUp',
                        'X-Amz-User-Agent': 'aws-sdk-js/2.0.0',
                        'X-Amz-Region': window.config.AWS_REGION 
                    },
                    body: JSON.stringify({
                        ClientId: window.config.COGNITO_CLIENT_ID, 
                        Username: username,
                        Password: password,
                        UserAttributes: [
                            { Name: 'email', Value: email },
                            { Name: 'name', Value: name },
                            { Name: 'family_name', Value: familyName }
                        ]
                    })
                });

                const result = await response.json();

                if (response.ok && (result.UserConfirmed || result.UserSub)) { 
                    console.log('Registro exitoso:', result);
                    alert('Registro exitoso. Por favor, verifica tu correo electrónico para confirmar tu cuenta.');

                    if (typeof gtag === 'function') {
                        gtag('event', 'register', {
                            method: 'Cognito',
                            email: email,
                            username: username
                        });
                    } else {
                        console.error('gtag no está definido');
                    }

                    window.location.href = 'login.html'; 
                } else {
                    console.error('Error en el registro:', result);
                    alert('Error en el registro: ' + (result.message || 'Error desconocido'));
                }

            } catch (error) {
                console.error('Error al registrarse:', error);
                alert('Error al registrarse: ' + error.message);
            }
        });
    } else {
        console.error('El formulario de registro no se encontró.');
    }

    const googleRegistroButton = document.getElementById('google-login');
    if (googleRegistroButton) {
        googleRegistroButton.addEventListener('click', function() {
            window.location.href = window.config.GOOGLE_AUTH_URL;
        });
    }
});
