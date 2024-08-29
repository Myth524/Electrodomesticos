document.addEventListener('DOMContentLoaded', function() {
    
    var loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const email = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(window.config.COGNITO_AUTH_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-amz-json-1.1',
                        'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
                        'X-Amz-User-Agent': 'aws-sdk-js/2.0.0',
                    },
                    body: JSON.stringify({
                        AuthParameters: {
                            USERNAME: email,
                            PASSWORD: password
                        },
                        AuthFlow: 'USER_PASSWORD_AUTH',
                        ClientId: window.config.COGNITO_CLIENT_ID 
                    })
                });

                const result = await response.json();

                if (result.AuthenticationResult) {
                    console.log('Inicio de sesión exitoso:', result);
                    
                    const accessToken = result.AuthenticationResult.AccessToken;
                    localStorage.setItem('accessToken', accessToken);

                    window.location.href = 'index.html';
                } else {
                    console.error('Error en el inicio de sesión:', result);
                    alert('Inicio de sesión fallido: ' + (result.message || 'Error desconocido'));
                }
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                alert('Error al iniciar sesión: ' + error.message);
            }
        });
    } else {
        console.error('El formulario de inicio de sesión no se encontró.');
    }

    var googleLoginButton = document.getElementById('google-login');
    if (googleLoginButton) {
        googleLoginButton.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = window.config.GOOGLE_AUTH_URL;
        });
    }

});
