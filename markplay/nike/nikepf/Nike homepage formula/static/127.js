nike.unite.experience.load({
  "settings": {
    "uxId": "com.nike.commerce.nikedotcom.web",
    "theme": "unite",
    "locale": "en_US",
    "dialect": "en_US",
    "social": {
      "networks": [
        {
          "displayName": "Facebook",
          "linkText": "LOG IN WITH FACEBOOK",
          "name": "Facebook"
        }
      ]
    },
    "environments": {
      "local": {
        "acceptanceServiceUrl": "/__wel_absolute/ecn77-api.nikedev.com/rest/acceptance",
        "agreementServiceUrl": "/__wel_absolute/agreement.test.svs.nike.com/rest/agreement",
        "avatarBaseUrl": "/vc/profile",
        "backendEnvironment": "ecn87",
        "cors": "/__wel_absolute/unite.nikedev.com",
        "gigyaApiKey": "2_BtC6DfARWcO0QvjrtZ0ewbtaAiSz7AmDJH5oDI211Jt0Qx3ipyoogKnHxom1aag4",
        "facebookAppId": "1397260880304609",
        "weChatMiniAppId": "wx4dc68d809dab5a54",
        "lineAppId": "1574313282",
        "lineRedirectURL": "/__wel_absolute/local-www.nikedev.com:8080/lineRedirect.html",
        "segmentAuthHeader": "Basic Vnl0bkV5TkZEaGxBZkVOUEZ1TE9IZm9kd05RTGNocnY6",
        "api": {
          "createUser": {
            "cors": "/__wel_absolute/unite.nikedev.com",
            "path": "/access/users/v1"
          },
          "segmentBatch": {
            "cors": "/__wel_absolute/analytics.nike.com/v1",
            "path": "/batch"
          }
        },
        "enableAnalytics": false
      },
      "ci": {
        "acceptanceServiceUrl": "/__wel_absolute/ecn77-api.nikedev.com/rest/acceptance",
        "agreementServiceUrl": "/__wel_absolute/agreement.test.svs.nike.com/rest/agreement",
        "avatarBaseUrl": "/vc/profile",
        "backendEnvironment": "ecn87",
        "cors": "/__wel_absolute/unite.nikedev.com",
        "gigyaApiKey": "2_BtC6DfARWcO0QvjrtZ0ewbtaAiSz7AmDJH5oDI211Jt0Qx3ipyoogKnHxom1aag4",
        "facebookAppId": "1397260880304609",
        "weChatMiniAppId": "wx4dc68d809dab5a54",
        "lineAppId": "1574313282",
        "lineRedirectURL": "/__wel_absolute/s3.nikecdn.com/unite-dev/ci/lineRedirect.html",
        "segmentAuthHeader": "Basic Vnl0bkV5TkZEaGxBZkVOUEZ1TE9IZm9kd05RTGNocnY6",
        "api": {
          "createUser": {
            "cors": "/__wel_absolute/unite.nikedev.com",
            "path": "/access/users/v1"
          },
          "segmentBatch": {
            "cors": "/__wel_absolute/analytics.nike.com/v1",
            "path": "/batch"
          }
        },
        "enableAnalytics": true
      },
      "production": {
        "acceptanceServiceUrl": "/__wel_absolute/api.nike.com/rest/acceptance",
        "agreementServiceUrl": "/__wel_absolute/agreementservice.svs.nike.com/rest/agreement",
        "avatarBaseUrl": "/vc/profile",
        "backendEnvironment": "",
        "cors": "/__wel_absolute/unite.nike.com",
        "gigyaApiKey": "2_IIKHKceEmeqTxf-7vybsrw5g-6NnFG3ykf2bPYS5PwX7T09Mk-ykJZaAZMMIVzTN",
        "facebookAppId": "1397260880304609",
        "weChatMiniAppId": "wx096c43d1829a7788",
        "lineAppId": "1574313282",
        "lineRedirectURL": "/__wel_absolute/s3.nikecdn.com/unite/lineRedirect.html",
        "segmentAuthHeader": "Basic MjY3Ymo3M085Wm15WlEyTFVNVmdBY0xrMHE1QmllSnU6",
        "api": {
          "createUser": {
            "cors": "/__wel_absolute/unite.nike.com",
            "path": "/access/users/v1"
          },
          "segmentBatch": {
            "cors": "/__wel_absolute/analytics.nike.com/v1",
            "path": "/batch"
          }
        },
        "enableAnalytics": true
      }
    },
    "isDefaultFacebookAppId": false,
    "viewId": "unite",
    "progressiveFields": [],
    "progressive": {
      "contexts": {
        "login": [
          "isLegallyCompliant"
        ],
        "join": [
          "isLegallyCompliant"
        ],
        "mobileJoin": [
          "isLegallyCompliant",
          "captureDobAndEmail"
        ],
        "partnerLogin": [
          "isLegallyCompliant",
          "partnerConnect"
        ],
        "partnerJoin": [
          "isLegallyCompliant",
          "partnerConnect"
        ]
      },
      "states": {
        "isEmailVerified": {
          "layout": "{{verifyEmailHeader}}{{#progressiveForm}}{{sendEmailCode}}{{verifyCode}}{{progressiveSubmit}}{{/progressiveForm}}",
          "endpoint": "userState"
        },
        "isLegallyCompliant": {
          "layout": "{{progressiveHeader}}{{#progressiveForm}}{{verifyMobilePhoneNumber}}{{progressiveSubmit}}{{/progressiveForm}}",
          "endpoint": "userState"
        },
        "isMobileVerified": {
          "layout": "{{progressiveHeader}}{{#progressiveForm}}{{verifyMobilePhoneNumber}}<p class='progressive-terms'>You will receive your code momentarily. You may experience a delay if there are issues with your wireless provider. Msg&Data rates may apply. If you've previously unsubscribed, reply START to 73067 to opt back in to mobile verification.</p>{{progressiveLegal}}{{isMobileVerifiedSubmit}}{{/progressiveForm}}",
          "endpoint": "userState"
        },
        "isSneakerHead": {
          "layout": "{{progressiveHeader}}{{#progressiveForm}}{{verifyMobilePhoneNumber}}{{progressiveSubmit}}{{/progressiveForm}}",
          "endpoint": "userState"
        },
        "hasAcceptedSwooshTerms": {
          "layout": "{{swooshLegalHeader}}{{#swooshLegalForm}}{{swooshLegalTermsText}}{{swooshProgressiveTerms}}{{swooshLegalButton}}{{/swooshLegalForm}}",
          "endpoint": "acceptance"
        },
        "hasDateOfBirth": {
          "layout": "{{captureDOBHeader}}{{#captureDOBForm}}{{dateOfBirth}}{{captureDOBSubmit}}{{/captureDOBForm}}",
          "endpoint": "userState"
        },
        "captureDobAndEmail": {
          "layout": "{{mobileJoinDobEmailHeader}}{{#mobileJoinDobEmailForm}}{{dateOfBirthOptional}}{{emailAddressOptional}}{{mobileJoinDobEmailSubmit}}{{mobileJoinDobEmailSkipButton}}{{/mobileJoinDobEmailForm}}",
          "endpoint": "update"
        },
        "hasDateOfBirthOptional": {
          "layout": "{{captureDOBHeader}}{{#captureDOBForm}}{{dateOfBirthOptional}}{{mobileJoinDobEmailSubmit}}{{mobileJoinDobEmailSkipButton}}{{/captureDOBForm}}",
          "endpoint": "update"
        },
        "hasEmail": {
          "layout": "{{captureEmailHeader}}{{#captureEmailForm}}{{emailAddress}}{{captureEmailSubmit}}{{/captureEmailForm}}",
          "endpoint": "userState"
        },
        "hasFirstAndLastName": {
          "layout": "{{captureProgressiveHeader}}{{#progressiveForm}}{{firstName}}{{lastName}}{{progressiveSubmitWithSkip}}{{progressiveSkipButton}}{{/progressiveForm}}",
          "endpoint": "update"
        },
        "hasShoppingGender": {
          "layout": "{{captureProgressiveHeader}}{{#progressiveForm}}{{shoppingGender}}{{progressiveSubmitWithSkip}}{{progressiveSkipButton}}{{/progressiveForm}}",
          "endpoint": "update"
        },
        "canCheckOut": {
          "layout": "{{captureEmailHeader}}{{#captureEmailForm}}{{emailAddress}}{{captureEmailSubmit}}{{/captureEmailForm}}",
          "endpoint": "userState"
        },
        "canRegisterEvent": {
          "layout": "{{captureEmailHeader}}{{#captureEmailForm}}{{emailAddress}}{{captureEmailSubmit}}{{/captureEmailForm}}",
          "endpoint": "userState"
        },
        "partnerConnect": {
          "layout": "{{partnerHeader}}{{partnerSubheader}}{{partnerPermissions}}{{#partnerConnectForm}}{{partnerTerms}}{{connectSubmit}}{{partnerModifyConnection}}{{/partnerConnectForm}}",
          "endpoint": "acceptance"
        },
        "needsBrazilMigration": {
          "layout": "{{migrationProgressiveHeader}}{{#progressiveForm}}{{firstName}}{{lastName}}{{dateOfBirth}}{{shoppingGender}}{{progressiveSubmit}}{{/progressiveForm}}",
          "endpoint": "userState"
        }
      }
    },
    "setCookieOnLogin": true,
    "useLegacyGetUser": true,
    "oauthRedirectURIWhitelist": "^$",
    "passwordRedirectURL": "/",
    "passwordResetEmailTemplate": "TSD_PROF_PASSWORD_RESET_V1.0",
    "welcomeEmailTemplate": "TSD_PROF_MS_WELC_T0_GENERIC_V1.0",
    "atgSync": true,
    "atgLogoutOnLogin": false,
    "partnerName": "partner",
    "enableMobileJoin": false,
    "allowSwooshSSO": true,
    "legalServiceRequestType": "redirect",
    "dateFormat": "{mm}/{dd}/{yyyy}",
    "swooshEnabled": false
  },
  "views": {
    "appLanding": {
      "src": "nike-unite-app-landing-view",
      "layout": "{{landingHeader}}{{loginButton}}{{joinButton}}"
    },
    "confirmPasswordReset": {
      "src": "nike-unite-confirm-password-reset-view",
      "layout": "{{confirmPasswordResetForm}}{{confirmPasswordResetBlock}}{{emailAddress}}{{resetLoginButton}}{{/confirmPasswordResetForm}}"
    },
    "confirmPartnerConnect": {
      "src": "nike-unite-progressive-profile-view",
      "layout": "{{confirmPartnerConnectBlock}}"
    },
    "emailOnlyJoin": {
      "duplicateEmailCheck": false,
      "src": "nike-unite-join-view",
      "classes": [],
      "layout": "{{coppa}}{{emailOnlyJoinHeader}}{{#joinForm}}{{emailAddress}}{{dateOfBirth}}{{shoppingGenderDropdown}}{{emailOnlyJoinSubmit}}{{emailOnlyJoinTerms}}{{/joinForm}}"
    },
    "error": {
      "src": "nike-unite-error-view",
      "layout": "{{errorPanel}}"
    },
    "join": {
      "aliasFor": false,
      "duplicateEmailCheck": true,
      "src": "nike-unite-join-view",
      "flowOverride": false,
      "classes": [],
      "layout": "{{coppa}}{{joinHeaderExperiment}}{{#joinForm}}{{socialRegister}}{{emailAddress}}{{passwordCreate}}{{firstName}}{{lastName}}{{dateOfBirth}}{{country}}{{gender}}{{emailSignup}}{{joinTerms}}{{joinSubmit}}{{/joinForm}}{{currentMemberSignIn}}"
    },
    "link": {
      "src": "nike-unite-link-view",
      "layout": "{{linkHeader}}{{errorMessage}}{{#linkForm}}{{emailAddress}}{{password}}{{loginOptions}}{{linkTerms}}{{linkSubmit}}{{/linkForm}}{{linkSocialJoinLink}}"
    },
    "login": {
      "src": "nike-unite-login-view",
      "flowOverride": false,
      "layout": "{{loginHeader}}{{#loginForm}}{{errorMessage}}{{emailAddress}}{{password}}{{keepMeLoggedIn}}{{loginOptions}}{{loginTerms}}{{loginSubmit}}{{socialLogin}}{{loginJoinLink}}{{/loginForm}}"
    },
    "loginContinuity": {
      "src": "nike-unite-login-continuity-view",
      "layout": "{{loginContinuityHeader}}{{loginContinuityDialog}}"
    },
    "loginDropdown": {
      "src": "nike-unite-login-dropdown-view",
      "layout": "{{loginHeader}}{{#loginDropdownForm}}{{errorMessage}}{{emailAddress}}{{password}}{{loginOptions}}{{loginTerms}}{{loginSubmit}}{{loginCreateButton}}{{/loginDropdownForm}}{{socialLogin}}"
    },
    "verifyMobileCode": {
      "src": "nike-unite-mobile-verification-code-view",
      "layout": "{{verifyCodeHeader}}{{#verifyCodeForm}}{{stateKey}}{{code}}{{verifyCodeSubmit}}{{/verifyCodeForm}}{{progressNumberLink}}{{mobileVerificationHelp}}"
    },
    "mobileVerificationCode": {
      "src": "nike-unite-mobile-verification-code-view",
      "layout": "{{verifyCodeHeader}}{{#verifyCodeForm}}{{code}}{{verifyCodeSubmit}}{{/verifyCodeForm}}{{progressNumberLink}}{{mobileVerificationHelp}}"
    },
    "progressive": {
      "src": "nike-unite-progressive-profile-view",
      "layout": "{{progressiveHeader}}{{#progressiveForm}}{{verifyMobileNumber}}<p class='progressive-terms'>You will receive your code momentarily. You may experience a delay if there are issues with your wireless provider. Msg&Data rates may apply. If you've previously unsubscribed, reply START to 73067 to opt back in to mobile verification.</p>{{sendCodeSubmit}}{{/progressiveForm}}{{verifyCodeLink}}"
    },
    "reauth": {
      "src": "nike-unite-reauth-view",
      "flowOverride": "login",
      "layout": "{{reauthHeader}}{{#loginForm}}{{errorMessage}}{{reauthEmailAddress}}{{password}}{{loginOptions}}{{reauthSubmit}}{{/loginForm}}"
    },
    "resetPassword": {
      "src": "nike-unite-reset-password-view",
      "layout": "{{forgotPasswordBlock}}{{errorMessage}}{{#forgotPasswordForm}}{{emailAddress}}{{forgotPasswordSubmit}}{{resetUserPasswordLogIn}}{{/forgotPasswordForm}}"
    },
    "socialJoin": {
      "duplicateEmailCheck": true,
      "src": "nike-unite-join-view",
      "layout": "{{coppa}}{{joinSocialHeader}}{{socialJoinSubheader}}{{#joinForm}}{{emailAddress}}{{passwordCreate}}{{firstName}}{{lastName}}{{dateOfBirth}}{{country}}{{gender}}{{emailSignup}}{{socialJoinTerms}}{{socialJoinSubmit}}{{/joinForm}}{{currentMemberSocialLink}}"
    },
    "updatePassword": {
      "src": "nike-unite-update-password-view",
      "layout": "{{updatePasswordBlock}}{{#updatePasswordForm}}{{passwordCreate}}{{updatePasswordSubmit}}{{/updatePasswordForm}}"
    },
    "mobileJoin": {
      "src": "nike-unite-join-view",
      "layout": "{{mobileJoinHeader}}{{mobileJoinSubheader}}{{#mobileJoinForm}}{{verifyMobilePhoneNumber}}{{country}}{{mobileJoinContinue}}{{/mobileJoinForm}}{{mobileJoinSocialRegister}}{{currentMobileNumberMemberSignIn}}"
    },
    "mobileJoinContinue": {
      "src": "nike-unite-join-view",
      "flowOverride": "join",
      "layout": "{{coppa}}{{mobileJoinCreateHeader}}{{#mobileJoinForm}}{{firstName}}{{lastName}}{{passwordCreate}}{{gender}}{{mobileNumberSignup}}{{joinTerms}}{{mobileJoinSubmit}}{{mobileJoinBackButton}}{{/mobileJoinForm}}"
    },
    "weChatMiniMobileJoin": {
      "src": "nike-unite-join-view",
      "layout": "{{mobileJoinHeader}}{{mobileJoinSubheader}}{{#mobileJoinForm}}{{verifyMobilePhoneNumber}}{{mobileJoinContinue}}{{/mobileJoinForm}}{{mobileJoinSocialRegister}}{{currentMemberMobileSocialLink}}"
    },
    "weChatMiniMobileJoinContinue": {
      "src": "nike-unite-join-view",
      "flowOverride": "weChatMiniMobileJoin",
      "layout": "{{coppa}}{{joinSocialHeader}}{{socialJoinSubheader}}{{#mobileJoinForm}}{{weChatMiniPhone}}{{lastName}}{{firstName}}{{passwordCreate}}{{gender}}{{mobileNumberSignup}}{{joinTerms}}{{mobileJoinSubmit}}{{mobileJoinBackButton}}{{/mobileJoinForm}}"
    },
    "mobileLogin": {
      "src": "nike-unite-login-view",
      "flowOverride": "login",
      "layout": "{{loginHeader}}{{#mobileLoginForm}}{{errorMessage}}{{verifyMobileNumber}}{{password}}{{mobileNumberToEmailLoginLink}}{{keepMeLoggedIn}}{{mobileLoginOptions}}{{loginTerms}}{{mobileLoginSubmit}}{{socialLogin}}{{mobileLoginJoinLink}}{{/mobileLoginForm}}"
    },
    "mobileResetPassword": {
      "src": "nike-unite-reset-password-view",
      "flowOverride": "resetPassword",
      "layout": "{{mobileForgotPasswordBlock}}{{errorMessage}}{{#mobileForgotPasswordForm}}{{verifyMobileNumber}}{{mobileNumberToEmailResetPasswordLink}}{{forgotPasswordSubmit}}{{mobileResetUserPasswordLogIn}}{{/mobileForgotPasswordForm}}"
    },
    "mobileConfirmPasswordReset": {
      "src": "nike-unite-confirm-password-reset-view",
      "layout": "{{confirmPasswordResetForm}}{{confirmPasswordResetBlock}}{{verifyMobileNumber}}{{resetLoginButton}}{{/confirmPasswordResetForm}}"
    },
    "mobileReauth": {
      "src": "nike-unite-reauth-view",
      "flowOverride": "login",
      "layout": "{{reauthHeader}}{{#mobileLoginForm}}{{errorMessage}}{{verifyMobileNumber}}{{password}}{{mobileNumberToEmailReauthLink}}{{mobileLoginOptions}}{{loginSubmit}}{{/mobileLoginForm}}"
    },
    "mobileSocialJoin": {
      "duplicateEmailCheck": true,
      "src": "nike-unite-join-view",
      "layout": "{{joinSocialHeader}}{{socialJoinSubheader}}{{#mobileJoinForm}}{{verifyMobilePhoneNumber}}{{country}}{{mobileJoinContinue}}{{/mobileJoinForm}}{{currentMemberMobileSocialLink}}"
    },
    "mobileLink": {
      "src": "nike-unite-login-view",
      "layout": "{{linkHeader}}{{#mobileLinkForm}}{{errorMessage}}{{verifyMobileNumber}}{{password}}{{linkMobileNumberToEmailLink}}{{mobileLoginOptions}}{{linkTerms}}{{mobileLoginSubmit}}{{/mobileLinkForm}}{{linkMobileSocialJoinLink}}"
    }
  },
  "components": {
    "weChatMiniPhone": {
      "type": "block",
      "value": "<div class=\"nike-unite-component nike-unite-wechat-phone\">Mobile Number {{phoneNumberKey}}{{weChatEditLink}}</div>"
    },
    "coppa": {
      "type": "coppa"
    },
    "headerImage": {
      "type": "block",
      "value": "{{nikeSwoosh}}"
    },
    "errorMessage": {
      "type": "errorMessage"
    },
    "errorMessageUpdatePasswordInvalidToken": {
      "type": "errorMessage",
      "messages": [
        {
          "text": "Your reset link has expired. Please send a new message to try again."
        }
      ]
    },
    "errorMessageLogin": {
      "type": "errorMessage",
      "messages": [
        {
          "text": "Your email or password was entered incorrectly."
        }
      ]
    },
    "errorMessageMobileLogin": {
      "type": "errorMessage",
      "messages": [
        {
          "text": "Your phone number or password was entered incorrectly."
        }
      ]
    },
    "errorPanel": {
      "type": "errorPanel",
      "title": "",
      "messages": [],
      "dismissMessage": "Dismiss this error",
      "buttonLink": "",
      "byKey": {
        "connection.error": {
          "title": "Communication error",
          "messages": [
            {
              "text": "Sorry, we can't talk to our servers right now. Please try again later, or try using a different device."
            }
          ],
          "dismissMessage": "OK",
          "classes": [
            "no-internet"
          ]
        },
        "dpa.reactivation.user.wait.timeout": {
          "classes": [
            "errorPanelDPA"
          ],
          "title": "WELCOME BACK",
          "messages": [
            {
              "text": "We haven't seen you in a while. Give us a moment while we retrieve your account information."
            }
          ]
        },
        "EmailSignup.dateOfBirth.InvalidCOPPAweb": {
          "title": "Not eligible for registration",
          "messages": [
            {
              "text": "Sorry, you are not eligible to access this experience. Please contact customer support with any questions or concerns."
            }
          ],
          "dismissMessage": "CUSTOMER SUPPORT",
          "buttonLink": "/__wel_absolute/help-en-us.nike.com/app/contact"
        },
        "general.error.connect": {
          "title": "An error occurred.",
          "messages": [
            {
              "text": "We are unable to connect to our servers right now. Please try again later."
            }
          ]
        },
        "previous.coppa.failure": {
          "title": "Not eligible for registration",
          "messages": [
            {
              "text": "We’re not able to complete your registration due to previous unsuccessful attempts. Please contact our Consumer Services team."
            }
          ],
          "dismissMessage": "CUSTOMER SUPPORT",
          "buttonLink": "/__wel_absolute/help-en-us.nike.com/app/contact"
        },
        "socialNetwork.update.failure": {
          "title": "An error occurred.",
          "messages": [
            {
              "text": "Failed to create or update the link to a social network."
            }
          ]
        },
        "socialNetwork.wechat.InvalidApi": {
          "title": "An error occurred.",
          "messages": [
            {
              "text": "We have encountered a problem and we are not able to complete your request right now. Please try again later."
            }
          ]
        },
        "socialNetwork.wechat.LoginError": {
          "title": "An error occurred.",
          "messages": [
            {
              "text": "We have encountered a problem and we are not able to complete your request right now. Please try again later."
            }
          ]
        },
        "socialNetwork.wechat.NotInstalled": {
          "title": "An error occurred.",
          "messages": [
            {
              "text": "WeChat must be installed on your device in order to login with WeChat."
            }
          ]
        },
        "socialNetwork.wechat.NotRegistered": {
          "title": "An error occurred.",
          "messages": [
            {
              "text": "We have encountered a problem and we are not able to complete your request right now. Please try again later."
            }
          ]
        },
        "email.notUnique": {
          "title": "An error occurred.",
          "messages": [
            {
              "text": "Email address is already in use. Please try again."
            }
          ]
        }
      }
    },
    "updatePasswordForm": {
      "id": "updatePasswordForm",
      "type": "form"
    },
    "updatePasswordSubmit": {
      "type": "submitButton",
      "label": "UPDATE PASSWORD",
      "labelProcessing": "PROCESSING…",
      "formId": "updatePasswordForm",
      "actions": {
        "submit": "updatePassword"
      }
    },
    "connectSubmit": {
      "type": "submitButton",
      "label": "CONNECT",
      "labelProcessing": "CONNECT...",
      "formId": "partnerConnectForm",
      "actions": {
        "submit": "connect"
      }
    },
    "mobileJoinContinue": {
      "type": "submitButton",
      "label": "CONTINUE",
      "labelProcessing": "PROCESSING…",
      "formId": "mobileJoinForm"
    },
    "swooshLegalButton": {
      "type": "submitButton",
      "label": "ACCEPT",
      "labelProcessing": "ACCEPT",
      "view": "swooshLegal",
      "formId": "swooshLegalForm"
    },
    "loginButton": {
      "type": "actionButton",
      "label": "LOG IN",
      "view": "login"
    },
    "joinButton": {
      "type": "actionButton",
      "label": "JOIN NIKE",
      "view": "join"
    },
    "loginCreateButton": {
      "type": "actionButton",
      "label": "JOIN NOW",
      "view": "join"
    },
    "mobileJoinBackButton": {
      "type": "actionButton",
      "label": "BACK",
      "view": "mobileJoin"
    },
    "weChatEditLink": {
      "type": "actionLink",
      "label": "",
      "linkText": "<i class=\"nike-unite-g72-edit\"></i>",
      "view": "weChatMiniMobileJoin"
    },
    "resetLoginButton": {
      "type": "actionButton",
      "label": "BACK TO LOGIN",
      "view": "login"
    },
    "landingHeader": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">WELCOME TO NIKE</div><div class=\"view-sub-header\">Nike at your service, providing access to ultimate gear, expert guidance, incredible experiences, and endless motivation.</div></header>"
    },
    "mobileVerificationHelp": {
      "type": "block",
      "value": "<p>If you still don't receive a code, please check that your mobile service provider has enabled short codes on your device. Additionally, we do not support VoIP numbers such as Google Voice. Please ensure you are using the number given to you by your cellular provider.<br /><br />Still having problems? Check our <a {{mobileFAQLink}}>FAQs</a> or call us at {{mobileHelpNumber}}.</p>"
    },
    "linkHeader": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">LINK YOUR ACCOUNT</div><div class=\"view-sub-header\" id=\"nike-unite-social-network-replace\">Log in to connect your {{provider}} account to Nike. You only need to do this once.</div></header>"
    },
    "linkSubmit": {
      "type": "submitButton",
      "label": "LOG IN",
      "labelProcessing": "PROCESSING…",
      "formId": "linkForm",
      "actions": {
        "submit": "login"
      }
    },
    "linkForm": {
      "id": "linkForm",
      "type": "form"
    },
    "loginJoinLink": {
      "type": "actionLink",
      "classes": [
        "nike-unite-component",
        "action-link",
        "current-member-signin"
      ],
      "label": "Not a member?",
      "view": "join",
      "linkText": "Join now."
    },
    "linkSocialJoinLink": {
      "type": "actionLink",
      "classes": [
        "nike-unite-component",
        "action-link",
        "current-member-signin"
      ],
      "label": "Not a member?",
      "view": "socialJoin",
      "linkText": "Join now."
    },
    "linkMobileSocialJoinLink": {
      "type": "actionLink",
      "classes": [
        "nike-unite-component",
        "action-link",
        "current-member-signin"
      ],
      "label": "Not a member?",
      "view": "mobileSocialJoin",
      "linkText": "Join now."
    },
    "mobileLoginJoinLink": {
      "type": "actionLink",
      "classes": [
        "nike-unite-component",
        "action-link",
        "current-member-signin"
      ],
      "label": "Not a member?",
      "view": "mobileJoin",
      "linkText": "Join now."
    },
    "partnerHeader": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">CONNECT YOUR NIKE ACCOUNT</div></header>"
    },
    "partnerSubheader": {
      "type": "block",
      "value": "{{partnerImage}}<div id=\"partnerSubheader\" class=\"view-sub-header\">By connecting, you will allow {{partnerName}} to:</div>"
    },
    "partnerPermissions": {
      "type": "block",
      "value": "<div id=\"partnerMessage\" class=\"view-sub-header nike-unite-message\"><span class=\"nike-unite-submessage\">Access your Nike basic user data. You also agree to share your Nike activity data, such as distance & time run, GPS data, heart rate, and calories burned. If you do not wish to share this data, do not connect.</span></div>"
    },
    "joinSocialHeader": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">YOU'RE ALMOST THERE</div></header>"
    },
    "emailOnlyJoinHeader": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">GET NEWS AND OFFERS FROM NIKE</div><div id=\"joinMessage\" class=\"view-sub-header nike-unite-message\">Be the first to know about the latest products, exclusives, and offers from Nike.</div></header>"
    },
    "joinHeaderExperiment": {
      "type": "joinHeaderExperiment",
      "variant": {
        "control": {
          "image": "{{headerImage}}",
          "viewHeader": "BECOME A NIKEPLUS MEMBER",
          "joinMessage": "Create your account and get access to member exclusive products, world-class experts, and instant benefits like fast and free shipping every time. Welcome to the biggest team in sport.",
          "learnMoreMessage": ""
        },
        "control_plus": {
          "image": "{{headerImage}}",
          "viewHeader": "BECOME A NIKEPLUS MEMBER",
          "joinMessage": "Create your account and get access to member exclusive products, world-class experts, and instant benefits like fast and free shipping every time. Welcome to the biggest team in sport.",
          "learnMoreMessage": "Learn More"
        },
        "variation_a": {
          "image": "{{headerImage}}",
          "viewHeader": "CREATE YOUR ACCOUNT",
          "joinMessage": "Your NikePlus account unlocks more benefits and services in our family of apps and on Nike.com.",
          "learnMoreMessage": "Learn More"
        },
        "variation_b": {
          "image": "{{headerImage}}",
          "viewHeader": "GET STARTED WITH NIKEPLUS",
          "joinMessage": "As a NikePlus member, you get access to all things Nike: Fast, free shipping, exclusive products, expert advice, plus more.",
          "learnMoreMessage": "Learn More"
        },
        "variation_c": {
          "image": "{{headerImage}}",
          "viewHeader": "CREATE YOUR FREE<br/>NIKEPLUS ACCOUNT",
          "joinMessage": "As a NikePlus member, you get access to all things Nike: Fast, free shipping, exclusive products, expert advice, plus more.",
          "learnMoreMessage": "Learn More"
        }
      }
    },
    "mobileJoinCreateHeader": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">CREATE YOUR NIKE ACCOUNT</div><div id=\"joinMessage\" class=\"view-sub-header nike-unite-message\">You're almost done! We need the following information to give you better service.</div></header>"
    },
    "reauthHeader": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">RE-ENTER YOUR PASSWORD</div><div class=\"view-sub-header\">To access this secure experience, please enter your Nike password.</div></header>"
    },
    "keepMeLoggedIn": {
      "dataField": "keepMeLoggedIn",
      "id": "keepMeLoggedIn",
      "label": "Keep me logged in",
      "rules": [],
      "tip": "",
      "type": "keepMeLoggedIn",
      "value": true
    },
    "socialJoinSubheader": {
      "type": "block",
      "value": "<div id=\"socialMessage\" class=\"view-sub-header nike-unite-message\">We have connected with your <provider name> account.<br/>{{socialIcon}}<span class=\"view-sub-header nike-unite-message\">Complete your profile to finish creating your account.</span></div>"
    },
    "swooshLegalHeader": {
      "type": "block",
      "value": "<header><div class=\"view-header swoosh-legal-header\">Swoosh Terms and Conditions\nHIGHLIGHTS</div></header>"
    },
    "mobileLoginForm": {
      "id": "mobileLoginForm",
      "type": "form"
    },
    "mobileJoinForm": {
      "id": "mobileJoinForm",
      "type": "form",
      "hiddenFields": {
        "registrationSiteId": "nikedotcom"
      }
    },
    "mobileJoinDobEmailForm": {
      "id": "mobileJoinDobEmailForm",
      "type": "form"
    },
    "mobileForgotPasswordForm": {
      "type": "form",
      "id": "mobileForgotPasswordForm"
    },
    "mobileLinkForm": {
      "id": "mobileLinkForm",
      "type": "form"
    },
    "mobileJoinHeader": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">CREATE YOUR NIKE ACCOUNT</div></header>"
    },
    "mobileJoinSubheader": {
      "type": "block",
      "value": "<div class=\"view-sub-header\">We need to verify your number to continue. We will send you a one-time code via SMS.</div>"
    },
    "swooshLegalTermsText": {
      "type": "block",
      "value": "<div class=\"swoosh-legal-terms\"><ul>\n<li>Purchased items may NOT be resold in any manner by any Swoosh user.</li>\n<li>Maximum order amount is $1000. Maximum order quantity is 6 items per style.</li>\n<li>Orders may only be shipped to a home address or non-NIKE business address. They can NOT be shipped to any NIKE facility including campuses and stores.</li>\n<li>Products purchased on Swoosh may be returned at any NIKE retail store in the U.S.</li>\n<li>All Swoosh returns to NIKE retail stores in the U.S. must be accompanied by your original packing slip or NIKE order number.</li>\n<li>Do NOT share your login or password with anyone.</li>\n<li>Do NOT purchase merchandise on behalf of non-Swoosh users if you receive reimbursement.</li>\n<li>Do NOT purchase merchandise for non-NIKE sponsored sports teams (e.g. your child&rsquo;s athletic team).</li>\n<li>Purchases must be made with Swoosh user&rsquo;s personal credit card.</li>\n</ul>\n<p><span style=\"text-decoration: underline;\">Eligible purchases</span></p>\n<p>Employees and family members registered on Swoosh may make purchases for:</p>\n<ul>\n<li>Themselves and as gifts for others</li>\n<li>Swoosh-eligible family members</li>\n</ul></div>"
    },
    "joinTerms": {
      "type": "block",
      "value": "<p class=\"terms\">By creating an account, you agree to Nike's <a {{policyLink}}>Privacy Policy</a> and <a {{termsLink}}>Terms of Use</a>.</p>"
    },
    "socialJoinTerms": {
      "type": "block",
      "value": "<p class=\"terms\">By creating an account, you agree to Nike's <a {{policyLink}}>Privacy Policy</a> and <a {{termsLink}}>Terms of Use</a>. Nike will store your {{provider}} account ID and may access any {{provider}} profile information you have chosen to share.</p>"
    },
    "emailOnlyJoinTerms": {
      "type": "block",
      "value": "<p class=\"terms\">By signing up, you agree to Nike's <a {{policyLink}}>Privacy Policy</a> and <a {{termsLink}}>Terms of Use</a>.</p>"
    },
    "linkTerms": {
      "type": "block",
      "value": "<p class=\"terms\">By logging in, you agree to Nike's <a {{policyLink}}>Privacy Policy</a> and <a {{termsLink}}>Terms of Use</a>. Nike will store your {{provider}} account ID and may access any {{provider}} profile information you have chosen to share.</p>"
    },
    "loginTerms": {
      "type": "block",
      "value": "<p class=\"terms\">By logging in, you agree to Nike's <a {{policyLink}}>Privacy Policy</a> and <a {{termsLink}}>Terms of Use</a>.</p>"
    },
    "partnerTerms": {
      "type": "block",
      "value": "<p class=\"terms\">By connecting, you agree to Nike's <a {{policyLink}}>Privacy Policy</a> and <a {{termsLink}}>Terms of Use</a>.</p>"
    },
    "swooshProgressiveTerms": {
      "type": "block",
      "value": "<p class=\"terms\">By clicking \"Accept\" you agree to Nike's\n<a {{policyLink}}>Privacy Policy</a>, <a {{termsLink}}>Terms of Use</a>, and  <a {{swooshTermsLink}}> Swoosh Terms</a>.</p>"
    },
    "partnerModifyConnection": {
      "type": "block",
      "value": "<p class=\"terms\">To view or modify your existing Nike connection, <a {{participantLink}}>visit this page</a></p>"
    },
    "policyLink": {
      "type": "block",
      "value": "href=\"javascript:void(0)\" onclick=\"javascript:nike.unite.openLegalLink('policyLink');\""
    },
    "partnerName": {
      "type": "block",
      "value": "undefined"
    },
    "swooshTermsLink": {
      "type": "block",
      "value": "href=\"javascript:void(0)\" onclick=\"javascript:nike.unite.openLegalLink('swooshTermsLink');\""
    },
    "termsLink": {
      "type": "block",
      "value": "href=\"javascript:void(0)\" onclick=\"javascript:nike.unite.openLegalLink('termsLink');\""
    },
    "participantLink": {
      "type": "block",
      "value": "href=\"javascript:void(0)\" onclick=\"javascript:nike.unite.openLegalLink('participantLink');\""
    },
    "joinForm": {
      "id": "joinForm",
      "type": "form",
      "hiddenFields": {
        "registrationSiteId": "nikedotcom"
      }
    },
    "firstName": {
      "dataField": "firstName",
      "type": "textInput",
      "value": "",
      "tip": "Please enter a valid first name.",
      "placeholder": "First Name",
      "label": "First Name",
      "rules": [
        {
          "active": true,
          "name": "required",
          "value": true,
          "errorMessage": "Please enter a valid first name.",
          "events": [
            "blur",
            "submit"
          ]
        },
        {
          "name": "unsupported",
          "errorMessage": "Deleting this field is not allowed.",
          "events": [
            "validation-deleteUserField"
          ]
        },
        {
          "name": "stringLength",
          "value": {
            "min": 0,
            "max": 40
          },
          "errorMessage": "First name cannot exceed {max} characters.",
          "events": [
            "blur",
            "submit",
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-updateUser"
          ],
          "variables": {
            "max": 40
          }
        },
        {
          "name": "notMatchPattern",
          "value": {
            "pattern": "@"
          },
          "errorMessage": "Please enter a valid first name.",
          "events": [
            "blur",
            "submit",
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-updateUser"
          ]
        },
        {
          "name": "isOfType",
          "value": [
            "string",
            "number",
            "boolean"
          ],
          "errorMessage": "Please enter a valid first name.",
          "events": [
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-updateUser"
          ]
        }
      ]
    },
    "lastName": {
      "dataField": "lastName",
      "type": "textInput",
      "value": "",
      "tip": "Please enter a valid last name.",
      "placeholder": "Last Name",
      "label": "Last Name",
      "rules": [
        {
          "active": true,
          "name": "required",
          "value": true,
          "errorMessage": "Please enter a valid last name.",
          "events": [
            "blur",
            "submit"
          ]
        },
        {
          "name": "unsupported",
          "errorMessage": "Deleting this field is not allowed.",
          "events": [
            "validation-deleteUserField"
          ]
        },
        {
          "name": "stringLength",
          "value": {
            "min": 0,
            "max": 40
          },
          "errorMessage": "Last names cannot exceed {max} characters.",
          "variables": {
            "max": 40
          },
          "events": [
            "blur",
            "submit",
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-updateUser"
          ]
        },
        {
          "name": "notMatchPattern",
          "value": {
            "pattern": "@"
          },
          "errorMessage": "Please enter a valid last name.",
          "events": [
            "blur",
            "submit",
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-updateUser"
          ]
        },
        {
          "name": "isOfType",
          "value": [
            "string",
            "number",
            "boolean"
          ],
          "errorMessage": "Please enter a valid last name.",
          "events": [
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-updateUser"
          ]
        }
      ]
    },
    "mobileFAQLink": {
      "type": "block",
      "value": "href=\"/__wel_absolute/help-en-us.nike.com/app/answers/detail/article/nike-mobile-verification\""
    },
    "mobileHelpNumber": {
      "type": "block",
      "value": "800-806-6453"
    },
    "dateOfBirth": {
      "dataField": "dateOfBirth",
      "type": "dateOfBirth",
      "label": "Date of Birth",
      "tip": "Please enter a valid date of birth.",
      "monthLabel": "Month",
      "dayLabel": "Day",
      "yearLabel": "Year",
      "ddLabel": "dd",
      "mmLabel": "mm",
      "yyyyLabel": "yyyy",
      "rules": [
        {
          "active": true,
          "name": "crossField",
          "type": "ageFields",
          "errorMessage": "Please enter a valid date of birth.",
          "events": [
            "validation-createUser",
            "validation-updateUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-emailOnlyCreateUser"
          ]
        },
        {
          "name": "unsupported",
          "errorMessage": "Deleting this field is not allowed.",
          "events": [
            "validation-deleteUserField"
          ]
        },
        {
          "active": true,
          "name": "matchPattern",
          "value": {
            "pattern": "^(19|20)\\d\\d[- \\.](0[1-9]|1[012])[- \\.](0[1-9]|[12][0-9]|3[01])$"
          },
          "errorMessage": "Please enter a valid date of birth.",
          "events": [
            "blur",
            "submit"
          ]
        },
        {
          "active": true,
          "name": "matchPattern",
          "value": {
            "pattern": "^(((19|20)\\d\\d[- \\.](0[1-9]|1[012])[- \\.](0[1-9]|[12][0-9]|3[01]))|(^-?[0-9]+))$"
          },
          "errorMessage": "Please enter a valid date of birth.",
          "events": [
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-updateUser",
            "validation-emailOnlyCreateUser"
          ]
        },
        {
          "active": true,
          "name": "dateInPast",
          "errorMessage": "Please enter a valid date of birth.",
          "events": [
            "blur",
            "change",
            "submit",
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-updateUser",
            "validation-emailOnlyCreateUser"
          ]
        },
        {
          "name": "isOfType",
          "value": [
            "string",
            "number"
          ],
          "errorMessage": "Please enter a valid date of birth.",
          "events": [
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-updateUser",
            "validation-emailOnlyCreateUser"
          ]
        },
        {
          "active": true,
          "name": "crossField",
          "lookup": "context.v1.location.country",
          "type": "coppaCompliance",
          "errorMessage": "We’re not able to complete your registration due to previous unsuccessful attempts. Please contact our Consumer Services team.",
          "events": [
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-updateUser",
            "validation-emailOnlyCreateUser"
          ]
        }
      ]
    },
    "dateOfBirthOptional": {
      "dataField": "dateOfBirth",
      "type": "dateOfBirth",
      "label": "Date of Birth",
      "tip": "Please enter a valid date of birth.",
      "monthLabel": "Month",
      "dayLabel": "Day",
      "yearLabel": "Year",
      "ddLabel": "dd",
      "mmLabel": "mm",
      "yyyyLabel": "yyyy",
      "rules": [
        {
          "active": true,
          "name": "matchPattern",
          "value": {
            "pattern": "^(19|20)\\d\\d[- \\.](0[1-9]|1[012])[- \\.](0[1-9]|[12][0-9]|3[01])$",
            "required": false
          },
          "errorMessage": "Please enter a valid date of birth.",
          "events": [
            "blur",
            "submit"
          ]
        },
        {
          "active": true,
          "name": "dateInPast",
          "errorMessage": "Please enter a valid date of birth.",
          "value": {
            "required": false
          },
          "events": [
            "blur",
            "change",
            "submit"
          ]
        }
      ]
    },
    "gender": {
      "dataField": "gender",
      "type": "genderButtons",
      "label": "Gender",
      "tip": "Please select a preference.",
      "options": [
        {
          "value": "M",
          "label": "Male"
        },
        {
          "value": "F",
          "label": "Female"
        }
      ],
      "rules": [
        {
          "active": true,
          "name": "required",
          "value": true,
          "errorMessage": "Please select a preference.",
          "events": [
            "blur",
            "change",
            "click",
            "submit"
          ]
        },
        {
          "name": "unsupported",
          "errorMessage": "Deleting this field is not allowed.",
          "events": [
            "validation-deleteUserField"
          ]
        },
        {
          "name": "matchPattern",
          "value": {
            "pattern": "^(O|F|M)$"
          },
          "errorMessage": "Invalid value entered.",
          "events": [
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-updateUser",
            "validation-emailOnlyCreateUser"
          ]
        }
      ]
    },
    "shoppingGender": {
      "dataField": "shoppingGender",
      "type": "genderButtons",
      "label": "Preferred Products",
      "tip": "Please select a preference.",
      "options": [
        {
          "value": "MENS",
          "label": "Men's"
        },
        {
          "value": "WOMENS",
          "label": "Women’s"
        }
      ],
      "rules": [
        {
          "active": true,
          "name": "required",
          "value": true,
          "errorMessage": "Please select a preference.",
          "events": [
            "blur",
            "change",
            "click",
            "submit"
          ]
        },
        {
          "name": "matchPattern",
          "value": {
            "pattern": "^(MENS|WOMENS)$",
            "required": false,
            "suffix": "i"
          },
          "errorMessage": "Invalid value entered.",
          "events": [
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-updateUser"
          ]
        },
        {
          "name": "isOfType",
          "value": [
            "string"
          ],
          "errorMessage": "Invalid value entered.",
          "events": [
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-updateUser"
          ]
        }
      ]
    },
    "shoppingGenderDropdown": {
      "dataField": "gender",
      "type": "select",
      "label": "Shopping Preference",
      "tip": "Please select a preference.",
      "useOptionGroup": false,
      "suppressBlank": true,
      "options": [
        {
          "value": "",
          "label": "Choose"
        },
        {
          "value": "M",
          "label": "Men's"
        },
        {
          "value": "F",
          "label": "Women’s"
        }
      ],
      "rules": [
        {
          "active": true,
          "name": "required",
          "value": true,
          "errorMessage": "Please select a preference.",
          "events": [
            "blur",
            "change",
            "submit"
          ]
        }
      ]
    },
    "duplicateEmailSignIn": {
      "type": "actionLink",
      "classes": [
        "nike-unite-component",
        "action-link"
      ],
      "label": "It looks like you're already a member.",
      "view": "login",
      "linkText": "Sign in."
    },
    "emailAddress": {
      "dataField": "emailAddress",
      "type": "emailAddress",
      "keyboardType": "email",
      "label": "Email address",
      "placeholder": "Email address",
      "duplicateEmailMessage": "{{duplicateEmailSignIn}}",
      "tip": "Please enter a valid email address.",
      "rules": [
        {
          "active": true,
          "name": "required",
          "value": true,
          "errorMessage": "Please enter a valid email address.",
          "events": [
            "blur",
            "submit",
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-updateUser",
            "validation-emailOnlyCreateUser"
          ]
        },
        {
          "name": "unsupported",
          "errorMessage": "Deleting this field is not allowed.",
          "events": [
            "validation-deleteUserField"
          ]
        },
        {
          "name": "stringLength",
          "value": {
            "min": 0,
            "max": 255
          },
          "errorMessage": "Please enter a valid email address.",
          "events": [
            "blur",
            "submit",
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-updateUser",
            "validation-emailOnlyCreateUser"
          ]
        },
        {
          "name": "matchPattern",
          "value": {
            "pattern": "^[-a-zA-Z0-9~!$%^&*_=+}{\\'?]+(\\.[-a-zA-Z0-9~!$%^&*_=+}{\\'?]+)*@([a-zA-Z0-9][-a-zA-Z0-9]*(\\.[-a-zA-Z0-9]+)*\\.([a-zA-Z0-9]+)|([0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}))(:[0-9]{1,5})?$"
          },
          "errorMessage": "Please enter a valid email address.",
          "events": [
            "blur",
            "submit"
          ]
        },
        {
          "name": "matchPattern",
          "value": {
            "pattern": "^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\\.)+[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$"
          },
          "errorMessage": "Please enter a valid email address.",
          "events": [
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-updateUser",
            "validation-emailOnlyCreateUser"
          ]
        },
        {
          "name": "isOfType",
          "value": [
            "string"
          ],
          "errorMessage": "Please enter a valid email address.",
          "events": [
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-updateUser",
            "validation-emailOnlyCreateUser"
          ]
        }
      ]
    },
    "emailAddressOptional": {
      "dataField": "emailAddress",
      "type": "emailAddress",
      "keyboardType": "email",
      "label": "Protect your account, in case you lose access to your mobile phone.",
      "placeholder": "Email address",
      "duplicateEmailMessage": "{{duplicateEmailSignIn}}",
      "tip": "Please enter a valid email address.",
      "rules": [
        {
          "name": "stringLength",
          "value": {
            "min": 0,
            "max": 255
          },
          "errorMessage": "Please enter a valid email address.",
          "events": [
            "blur",
            "submit"
          ]
        },
        {
          "name": "matchPattern",
          "value": {
            "pattern": "^[-a-zA-Z0-9~!$%^&*_=+}{\\'?]+(\\.[-a-zA-Z0-9~!$%^&*_=+}{\\'?]+)*@([a-zA-Z0-9][-a-zA-Z0-9]*(\\.[-a-zA-Z0-9]+)*\\.([a-zA-Z0-9]+)|([0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}))(:[0-9]{1,5})?$",
            "required": false
          },
          "errorMessage": "Please enter a valid email address.",
          "events": [
            "blur",
            "submit"
          ]
        }
      ]
    },
    "reauthEmailAddress": {
      "dataField": "emailAddress",
      "type": "reauthEmailAddress",
      "label": "Email address",
      "key": "emailAddress"
    },
    "password": {
      "dataField": "password",
      "type": "passwordInput",
      "label": "Password",
      "tip": "Please enter a password.",
      "rules": [
        {
          "active": true,
          "name": "required",
          "value": true,
          "errorMessage": "Please enter a password.",
          "events": [
            "blur",
            "submit"
          ]
        }
      ]
    },
    "country": {
      "hidden": false,
      "dataField": "country",
      "type": "country",
      "useOptionGroup": true,
      "supportedList": {
        "AD": "Andorra",
        "AE": "United Arab Emirates",
        "AF": "Afghanistan",
        "AG": "Antigua and Barbuda",
        "AI": "Anguilla",
        "AL": "Albania",
        "AM": "Armenia",
        "AN": "Netherlands Antilles",
        "AO": "Angola",
        "AQ": "Antarctica",
        "AR": "Argentina",
        "AS": "American Samoa",
        "AT": "Austria",
        "AU": "Australia",
        "AW": "Aruba",
        "AZ": "Azerbaijan",
        "BA": "Bosnia and Herzegovina",
        "BB": "Barbados",
        "BD": "Bangladesh",
        "BE": "Belgium",
        "BF": "Burkina Faso",
        "BG": "Bulgaria",
        "BH": "Bahrain",
        "BI": "Burundi",
        "BJ": "Benin",
        "BM": "Bermuda",
        "BN": "Brunei Darussalam",
        "BO": "Bolivia",
        "BR": "Brazil",
        "BS": "Bahamas",
        "BT": "Bhutan",
        "BV": "Bouvet Island",
        "BW": "Botswana",
        "BY": "Belarus",
        "BZ": "Belize",
        "CA": "Canada",
        "CC": "Cocos (Keeling) Islands",
        "CD": "Congo, The DRC",
        "CF": "Central African Republic",
        "CG": "Congo",
        "CH": "Switzerland",
        "CI": "Cote d'Ivoire",
        "CK": "Cook Islands",
        "CL": "Chile",
        "CM": "Cameroon",
        "CN": "China Mainland ",
        "CO": "Colombia",
        "CR": "Costa Rica",
        "CU": "Cuba",
        "CV": "Cape Verde",
        "CX": "Christmas Island",
        "CY": "Cyprus",
        "CZ": "Czech Republic",
        "DE": "Germany",
        "DJ": "Djibouti",
        "DK": "Denmark",
        "DM": "Dominica",
        "DO": "Dominican Republic",
        "DZ": "Algeria",
        "EC": "Ecuador",
        "EE": "Estonia",
        "EG": "Egypt",
        "EH": "Western Sahara",
        "ER": "Eritrea",
        "ES": "Spain",
        "ET": "Ethiopia",
        "EU": "European Union",
        "FI": "Finland",
        "FJ": "Fiji",
        "FK": "Falkland Islands (Malvinas)",
        "FM": "Micronesia, Federated States of",
        "FO": "Faroe Islands",
        "FR": "France",
        "GA": "Gabon",
        "GB": "United Kingdom",
        "GD": "Grenada",
        "GE": "Georgia",
        "GF": "French Guiana",
        "GH": "Ghana",
        "GI": "Gibraltar",
        "GL": "Greenland",
        "GM": "Gambia",
        "GN": "Guinea",
        "GP": "Guadeloupe",
        "GQ": "Equatorial Guinea",
        "GR": "Greece",
        "GS": "South Georgia and the South Sandwich Islands",
        "GT": "Guatemala",
        "GU": "Guam",
        "GW": "Guinea-Bissau",
        "GY": "Guyana",
        "HK": "Hong Kong",
        "HM": "Heard and McDonald Islands",
        "HN": "Honduras",
        "HR": "Croatia (local name: Hrvatska)",
        "HT": "Haiti",
        "HU": "Hungary",
        "ID": "Indonesia",
        "IE": "Ireland",
        "IL": "Israel",
        "IN": "India",
        "IO": "British Indian Ocean Territory",
        "IQ": "Iraq",
        "IR": "Iran (Islamic Republic of)",
        "IS": "Iceland",
        "IT": "Italy",
        "JM": "Jamaica",
        "JO": "Jordan",
        "JP": "Japan",
        "KE": "Kenya",
        "KG": "Kyrgyzstan",
        "KH": "Cambodia",
        "KI": "Kiribati",
        "KM": "Comoros",
        "KN": "Saint Kitts and Nevis",
        "KP": "Korea, D.P.R.O.",
        "KR": "Korea, Republic of",
        "KW": "Kuwait",
        "KY": "Cayman Islands",
        "KZ": "Kazakhstan",
        "LA": "Laos",
        "LB": "Lebanon",
        "LC": "Saint Lucia",
        "LI": "Liechtenstein",
        "LK": "Sri Lanka",
        "LR": "Liberia",
        "LS": "Lesotho",
        "LT": "Lithuania",
        "LU": "Luxembourg",
        "LV": "Latvia",
        "LY": "Libyan Arab Jamahiriya",
        "MA": "Morocco",
        "MC": "Monaco",
        "MD": "Moldova, Republic of",
        "ME": "Montenegro",
        "MG": "Madagascar",
        "MH": "Marshall Islands",
        "MK": "Macedonia",
        "ML": "Mali",
        "MM": "Myanmar (Burma)",
        "MN": "Mongolia",
        "MO": "Macau",
        "MP": "Northern Mariana Islands",
        "MQ": "Martinique",
        "MR": "Mauritania",
        "MS": "Montserrat",
        "MT": "Malta",
        "MU": "Mauritius",
        "MV": "Maldives",
        "MW": "Malawi",
        "MX": "Mexico",
        "MY": "Malaysia",
        "MZ": "Mozambique",
        "NA": "Namibia",
        "NC": "New Caledonia",
        "NE": "Niger",
        "NF": "Norfolk Island",
        "NG": "Nigeria",
        "NI": "Nicaragua",
        "NL": "Netherlands",
        "NO": "Norway",
        "NP": "Nepal",
        "NR": "Nauru",
        "NU": "Niue",
        "NZ": "New Zealand",
        "OM": "Oman",
        "PA": "Panama",
        "PE": "Peru",
        "PF": "French Polynesia",
        "PG": "Papua New Guinea",
        "PH": "Philippines",
        "PK": "Pakistan",
        "PL": "Poland",
        "PM": "St. Pierre and Miquelon",
        "PN": "Pitcairn",
        "PR": "Puerto Rico",
        "PT": "Portugal",
        "PW": "Palau",
        "PY": "Paraguay",
        "QA": "Qatar",
        "RE": "Reunion",
        "RO": "Romania",
        "RS": "Serbia",
        "RU": "Russian Federation",
        "RW": "Rwanda",
        "SA": "Saudi Arabia",
        "SB": "Solomon Islands",
        "SC": "Seychelles",
        "SD": "Sudan",
        "SE": "Sweden",
        "SG": "Singapore",
        "SH": "St. Helena",
        "SI": "Slovenia",
        "SJ": "Svalbard and Jan Mayen Islands",
        "SK": "Slovakia (Slovak Republic)",
        "SL": "Sierra Leone",
        "SM": "San Marino",
        "SN": "Senegal",
        "SO": "Somalia",
        "SR": "Suriname",
        "SS": "South Sudan",
        "ST": "Sao Tome and Principe",
        "SV": "El Salvador",
        "SY": "Syrian Arab Republic",
        "SZ": "Swaziland",
        "TC": "Turks and Caicos Islands",
        "TD": "Chad",
        "TF": "French Southern Territories",
        "TG": "Togo",
        "TH": "Thailand",
        "TJ": "Tajikistan",
        "TK": "Tokelau",
        "TL": "East Timor",
        "TM": "Turkmenistan",
        "TN": "Tunisia",
        "TO": "Tonga",
        "TR": "Turkey",
        "TT": "Trinidad and Tobago",
        "TV": "Tuvalu",
        "TW": "Taiwan",
        "TZ": "Tanzania, United Republic of",
        "UA": "Ukraine",
        "UG": "Uganda",
        "UM": "U.S. Minor Islands",
        "US": "United States",
        "UY": "Uruguay",
        "UZ": "Uzbekistan",
        "VA": "Holy See (Vatican City State)",
        "VC": "Saint Vincent and the Grenadines",
        "VE": "Venezuela",
        "VG": "Virgin Islands (British)",
        "VI": "Virgin Islands (U.S.)",
        "VN": "Vietnam",
        "VU": "Vanuatu",
        "WF": "Wallis and Futuna Islands",
        "WS": "Samoa",
        "XX": "Unknown Country/Region",
        "YE": "Yemen",
        "YT": "Mayotte",
        "ZA": "South Africa",
        "ZM": "Zambia",
        "ZW": "Zimbabwe"
      },
      "label": "Country/Region",
      "tip": "Choose your country/region.",
      "rules": [
        {
          "name": "required",
          "value": true,
          "errorMessage": "Choose your country/region.",
          "events": [
            "blur",
            "submit",
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-updateUser"
          ]
        },
        {
          "name": "unsupported",
          "errorMessage": "Deleting this field is not allowed.",
          "events": [
            "validation-deleteUserField"
          ]
        },
        {
          "name": "stringLength",
          "value": {
            "min": 0,
            "max": 40
          },
          "errorMessage": "Please enter a valid country/region code.",
          "events": [
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-updateUser"
          ]
        },
        {
          "name": "matchPattern",
          "value": {
            "pattern": "^(AD|AE|AF|AG|AI|AL|AM|AN|AO|AQ|AR|AS|AT|AU|AW|AZ|BA|BB|BD|BE|BF|BG|BH|BI|BJ|BM|BN|BO|BR|BS|BT|BV|BW|BY|BZ|CA|CC|CD|CF|CG|CH|CI|CK|CL|CM|CN|CO|CR|CU|CV|CX|CY|CZ|DE|DJ|DK|DM|DO|DZ|EC|EE|EG|EH|ER|ES|ET|EU|FI|FJ|FK|FM|FO|FR|GA|GB|GD|GE|GF|GH|GI|GL|GM|GN|GP|GQ|GR|GS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|ID|IE|IL|IN|IO|IQ|IR|IS|IT|JM|JO|JP|KE|KG|KH|KI|KM|KN|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|MG|MH|MK|ML|MM|MN|MO|MP|MQ|MR|MS|MT|MU|MV|MW|MX|MY|MZ|NA|NC|NE|NF|NG|NI|NL|NO|NP|NR|NU|NZ|OM|PA|PE|PF|PG|PH|PK|PL|PM|PN|PR|PT|PW|PY|QA|RE|RO|RS|RU|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|SK|SL|SM|SN|SO|SR|SS|ST|SV|SY|SZ|TC|TD|TF|TG|TH|TJ|TK|TL|TM|TN|TO|TR|TT|TV|TW|TZ|UA|UG|UM|US|UY|UZ|VA|VC|VE|VG|VI|VN|VU|WF|WS|YE|YT|ZA|ZM|ZW)$"
          },
          "errorMessage": "Please enter a valid country/region code.",
          "events": [
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-updateUser"
          ]
        },
        {
          "name": "matchPattern",
          "value": {
            "pattern": "^(AD|AE|AF|AG|AI|AL|AM|AN|AO|AQ|AR|AS|AT|AU|AW|AZ|BA|BB|BD|BE|BF|BG|BH|BI|BJ|BM|BN|BO|BR|BS|BT|BV|BW|BY|BZ|CA|CC|CD|CF|CG|CH|CI|CK|CL|CM|CN|CO|CR|CU|CV|CX|CY|CZ|DE|DJ|DK|DM|DO|DZ|EC|EE|EG|EH|ER|ES|ET|EU|FI|FJ|FK|FM|FO|FR|GA|GB|GD|GE|GF|GH|GI|GL|GM|GN|GP|GQ|GR|GS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|ID|IE|IL|IN|IO|IQ|IR|IS|IT|JM|JO|JP|KE|KG|KH|KI|KM|KN|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|MG|MH|MK|ML|MM|MN|MO|MP|MQ|MR|MS|MT|MU|MV|MW|MX|MY|MZ|NA|NC|NE|NF|NG|NI|NL|NO|NP|NR|NU|NZ|OM|PA|PE|PF|PG|PH|PK|PL|PM|PN|PR|PT|PW|PY|QA|RE|RO|RS|RU|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|SK|SL|SM|SN|SO|SR|SS|ST|SV|SY|SZ|TC|TD|TF|TG|TH|TJ|TK|TL|TM|TN|TO|TR|TT|TV|TW|TZ|UA|UG|UM|US|UY|UZ|VA|VC|VE|VG|VI|VN|VU|WF|WS|YE|YT|ZA|ZM|ZW)$"
          },
          "errorMessage": "Choose your country/region.",
          "events": [
            "blur",
            "submit"
          ]
        },
        {
          "name": "isOfType",
          "value": [
            "string"
          ],
          "errorMessage": "Please enter a valid country/region code.",
          "events": [
            "validation-createUser",
            "validation-validateExistingUser",
            "validation-mobilePhoneCreateUser",
            "validation-updateUser"
          ]
        },
        {
          "active": true,
          "name": "crossField",
          "lookup": "bio.v1.dob.date",
          "type": "coppaCompliance",
          "errorMessage": "Sorry, you are not eligible.",
          "events": [
            "validation-updateUser"
          ]
        }
      ]
    },
    "passwordCreate": {
      "dataField": "password",
      "type": "passwordCreateInput",
      "label": "Password",
      "showLabel": "SHOW",
      "hideLabel": "HIDE",
      "tip": "Please enter a password.",
      "labels": {
        "charLength": "Minimum of 8 characters",
        "upperCase": "1 uppercase letter",
        "lowerCase": "1 lowercase letter",
        "number": "1 number"
      },
      "lookups": {
        "screenName": "function (target) { if (target.form.screenName) { return target.form.screenName.value; }; return '';",
        "emailAddress": "function (target) { if (target.form.emailAddress) { return target.form.emailAddress.value; }; return '';"
      },
      "rulesOptions": {
        "validateAll": true,
        "force": false
      },
      "rules": [
        {
          "name": "crossField",
          "lookup": "screenName",
          "type": "notequal",
          "keys": [
            "screenName"
          ],
          "errorMessage": "Password cannot be the same as screen name.",
          "events": [
            "blur",
            "keyup",
            "submit"
          ]
        },
        {
          "name": "crossField",
          "lookup": "emailAddress",
          "type": "notequal",
          "keys": [
            "email"
          ],
          "errorMessage": "Your password can't be the same as your email.",
          "events": [
            "blur",
            "keyup",
            "submit"
          ]
        },
        {
          "name": "crossField",
          "lookup": "core.v1.screenname",
          "type": "notequal",
          "errorMessage": "Password cannot be the same as screen name.",
          "events": [
            "validation-createUser",
            "validation-mobilePhoneCreateUser",
            "validation-updatePassword"
          ]
        },
        {
          "name": "crossField",
          "lookup": "core.v1.username",
          "type": "notequal",
          "errorMessage": "Your password can't be the same as your email.",
          "events": [
            "validation-createUser",
            "validation-mobilePhoneCreateUser",
            "validation-updatePassword"
          ]
        },
        {
          "name": "matchPattern",
          "value": {
            "pattern": "[0-9]"
          },
          "keys": [
            "number"
          ],
          "errorMessage": "Password does not meet minimal requirements.",
          "events": [
            "blur",
            "keyup",
            "submit",
            "validation-createUser",
            "validation-mobilePhoneCreateUser",
            "validation-updatePassword"
          ]
        },
        {
          "name": "matchPattern",
          "value": {
            "pattern": "[a-z]"
          },
          "keys": [
            "lowerCase"
          ],
          "errorMessage": "Password does not meet minimal requirements.",
          "events": [
            "blur",
            "keyup",
            "submit",
            "validation-createUser",
            "validation-mobilePhoneCreateUser",
            "validation-updatePassword"
          ]
        },
        {
          "name": "matchPattern",
          "value": {
            "pattern": "[A-Z]"
          },
          "keys": [
            "upperCase"
          ],
          "errorMessage": "Password does not meet minimal requirements.",
          "events": [
            "blur",
            "keyup",
            "submit",
            "validation-createUser",
            "validation-mobilePhoneCreateUser",
            "validation-updatePassword"
          ]
        },
        {
          "name": "stringLength",
          "value": {
            "min": 8,
            "max": 36
          },
          "keys": [
            "charLength"
          ],
          "errorMessage": "Password does not meet minimal requirements.",
          "events": [
            "blur",
            "keyup",
            "submit",
            "validation-createUser",
            "validation-mobilePhoneCreateUser",
            "validation-updatePassword"
          ]
        },
        {
          "name": "required",
          "value": true,
          "errorMessage": "Password does not meet minimal requirements.",
          "events": [
            "validation-createUser",
            "validation-mobilePhoneCreateUser",
            "validation-updatePassword"
          ]
        },
        {
          "name": "unsupported",
          "errorMessage": "Updating this field is currently not supported",
          "value": true,
          "events": [
            "validation-updateUser",
            "validation-deleteUserField"
          ]
        }
      ]
    },
    "emailSignup": {
      "dataField": "receiveEmail",
      "type": "checkbox",
      "label": "Sign up for emails to hear all the latest from Nike.",
      "tip": "",
      "rules": [],
      "value": true,
      "alwaysRenderWithDefaultValue": true
    },
    "mobileNumberSignup": {
      "dataField": "receiveEmail",
      "type": "checkbox",
      "label": "Sign up for communications to receive the latest from Nike.",
      "tip": "",
      "rules": [],
      "value": false,
      "alwaysRenderWithDefaultValue": true
    },
    "joinSubmit": {
      "type": "submitButton",
      "label": "CREATE ACCOUNT",
      "labelProcessing": "PROCESSING…",
      "formId": "joinForm",
      "actions": {
        "submit": "join"
      }
    },
    "emailOnlyJoinSubmit": {
      "type": "submitButton",
      "label": "SIGN UP",
      "labelProcessing": "PROCESSING…",
      "formId": "joinForm",
      "actions": {
        "submit": "join"
      }
    },
    "mobileJoinSubmit": {
      "type": "submitButton",
      "label": "CREATE ACCOUNT",
      "labelProcessing": "PROCESSING…",
      "formId": "mobileJoinForm",
      "actions": {
        "submit": "mobileJoin"
      }
    },
    "socialJoinSubmit": {
      "type": "submitButton",
      "label": "CREATE ACCOUNT",
      "labelProcessing": "PROCESSING…",
      "formId": "joinForm",
      "actions": {
        "submit": "join"
      }
    },
    "loginHeader": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">YOUR ACCOUNT FOR EVERYTHING NIKE</div></header>"
    },
    "loginContinuityHeader": {
      "type": "block",
      "value": "<header>{{headerImage}}</header>"
    },
    "loginForm": {
      "id": "loginForm",
      "type": "form",
      "hiddenFields": {
        "registrationSiteId": "0"
      }
    },
    "partnerConnectForm": {
      "id": "partnerConnectForm",
      "type": "form"
    },
    "progressiveHeader": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">VERIFY YOUR MOBILE NUMBER</div><div class=\"view-sub-header\">For added security, we need to send you a one-time verification code to better ensure our product lands in the hands of our consumers.</div></header>"
    },
    "progressiveForm": {
      "id": "progressiveForm",
      "type": "form"
    },
    "loginDropdownForm": {
      "id": "loginDropdownForm",
      "type": "form"
    },
    "socialIcon": {
      "type": "block",
      "value": "<div class=\"nike-unite-component nike-unite-social-icon nike-unite-social-icon-{{providerKey}}\"></div>"
    },
    "socialLogin": {
      "type": "socialLinks",
      "value": "",
      "label": "Or sign in with:",
      "conjunction": "OR",
      "conjunctionPosition": "top",
      "mobile": false
    },
    "socialRegister": {
      "type": "socialLinks",
      "value": "",
      "label": "",
      "linkTextOverride": {
        "Facebook": "REGISTER WITH FACEBOOK"
      },
      "conjunction": "OR",
      "conjunctionPosition": "bottom",
      "mobile": false
    },
    "mobileJoinSocialRegister": {
      "type": "socialLinks",
      "value": "",
      "label": "",
      "linkTextOverride": {
        "Facebook": "REGISTER WITH FACEBOOK"
      },
      "conjunction": "OR",
      "conjunctionPosition": "top",
      "mobile": false
    },
    "swooshLegalForm": {
      "id": "swooshLegalForm",
      "type": "form"
    },
    "loginOptions": {
      "type": "block",
      "value": "<div class=\"nike-unite-login-options\">{{rememberMe}}{{forgotPassword}}</div>"
    },
    "mobileLoginOptions": {
      "type": "block",
      "value": "<div class=\"nike-unite-login-options\">{{rememberMe}}{{mobileForgotPassword}}</div>"
    },
    "rememberMe": {
      "key": "rememberMe",
      "type": "hidden",
      "value": "false",
      "label": "Remember me",
      "rules": []
    },
    "stateKey": {
      "key": "stateKey",
      "type": "hidden",
      "value": "",
      "rules": []
    },
    "loginSubmit": {
      "type": "submitButton",
      "label": "LOG IN",
      "labelProcessing": "PROCESSING…",
      "formId": "loginForm",
      "actions": {
        "submit": "login"
      }
    },
    "mobileLoginSubmit": {
      "type": "submitButton",
      "label": "LOG IN",
      "labelProcessing": "PROCESSING…",
      "formId": "mobileLoginForm",
      "actions": {
        "submit": "login"
      }
    },
    "reauthSubmit": {
      "type": "submitButton",
      "label": "SUBMIT",
      "labelProcessing": "PROCESSING…",
      "formId": "loginForm",
      "actions": {
        "submit": "login"
      }
    },
    "loginContinuityDialog": {
      "type": "loginContinuityDialog",
      "continueText": "Continue",
      "changeAccountText": "Use a different account",
      "joinTerms": "<p class=\"terms\">By logging in, you agree to Nike's <a {{policyLink}}>Privacy Policy</a> and <a {{termsLink}}>Terms of Use</a>.</p>"
    },
    "updatePasswordBlock": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">UPDATE PASSWORD</div><div class=\"view-sub-header\">Please enter your new password.</div></header>"
    },
    "forgotPasswordBlock": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">RESET PASSWORD</div><div class=\"view-sub-header\">Enter your email to receive instructions on how to reset your password.</div></header>"
    },
    "forgotEmailLink": {
      "type": "block",
      "value": "href=\"undefined\""
    },
    "forgotPassword": {
      "type": "actionLink",
      "label": "",
      "linkText": "Forgot password?",
      "view": "resetPassword"
    },
    "forgotPasswordForm": {
      "type": "form",
      "id": "forgotPasswordForm"
    },
    "forgotPasswordSubmit": {
      "type": "submitButton",
      "label": "RESET",
      "labelProcessing": "PROCESSING…",
      "formId": "forgotPasswordForm",
      "actions": {
        "submit": "resetPassword"
      }
    },
    "mobileForgotPassword": {
      "type": "actionLink",
      "label": "",
      "linkText": "Forgot password?",
      "view": "mobileResetPassword"
    },
    "confirmPasswordResetForm": {
      "type": "form",
      "id": "confirmPasswordResetForm"
    },
    "confirmPartnerConnectBlock": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">Connected!</div><p>You are in!</p></header>"
    },
    "confirmPasswordResetBlock": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">PASSWORD RESET</div><p>You should receive a link in a few moments. Please open that link to reset your password.</p></header>"
    },
    "verifyCodeHeader": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">ENTER YOUR CODE</div><div class=\"view-sub-header\">Do not leave this page. Retrieve the six digit verification code we recently sent you via SMS.</div></header>"
    },
    "mobileJoinDobEmailHeader": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">YOU'RE IN</div><div class=\"view-sub-header\">Congratulations, you are now a Nike member! You can gain even more benefits by telling us a little more about yourself.</div></header>"
    },
    "mobileJoinDobEmailSubmit": {
      "type": "submitButton",
      "label": "SAVE",
      "labelProcessing": "PROCESSING…",
      "formId": "mobileJoinDobEmailForm"
    },
    "mobileJoinDobEmailSkipButton": {
      "type": "actionButton",
      "label": "SKIP",
      "view": "mobileJoin",
      "action": "skip"
    },
    "captureDOBHeader": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">Enter your Date of Birth</div><div class=\"view-sub-header\">Provide your Date of Birth for a more personalized experience.</div></header>"
    },
    "captureDOBForm": {
      "id": "captureDOBForm",
      "type": "form"
    },
    "captureDOBSubmit": {
      "type": "submitButton",
      "label": "SAVE",
      "labelProcessing": "PROCESSING…",
      "formId": "captureDOBForm"
    },
    "captureEmailHeader": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">Enter your email</div><div class=\"view-sub-header\">For added security, please tell us your email address.</div></header>"
    },
    "captureEmailForm": {
      "id": "captureEmailForm",
      "type": "form"
    },
    "captureEmailSubmit": {
      "type": "submitButton",
      "label": "SAVE",
      "labelProcessing": "PROCESSING…",
      "formId": "captureEmailForm"
    },
    "mobileForgotPasswordBlock": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">RESET PASSWORD</div><div class=\"view-sub-header\">Enter your contact information to get instructions on how to reset your password.</div></header>"
    },
    "verifyCodeForm": {
      "type": "form",
      "id": "verifyCodeForm"
    },
    "verifyCodeSubmit": {
      "type": "submitButton",
      "labelProcessing": "PROCESSING…",
      "label": "SUBMIT",
      "formId": "verifyCodeForm",
      "actions": {
        "submit": "verifyCode"
      }
    },
    "verifyEmailHeader": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">VERIFY YOUR EMAIL</div><div class=\"view-sub-header\">For added security, we sent you a one-time verification code to better ensure our product lands in the hands of our consumers.</div></header>"
    },
    "progressiveLegal": {
      "id": "progressiveMobile",
      "dataField": "progressMobile",
      "type": "checkbox",
      "label": "<p class=\"progressive-legal\">I agree to receive one SMS message to verify my device, and to Nike’s <a {{policyLink}}>Privacy Policy</a> and <a {{termsLink}}>Terms of Use</a>.</p>",
      "tip": "",
      "value": false,
      "active": true,
      "rules": [
        {
          "name": "equal",
          "value": "true",
          "errorMessage": "",
          "events": [
            "change",
            "submit"
          ]
        }
      ]
    },
    "sendEmailCode": {
      "dataField": "emailAddress",
      "type": "sendEmailCode",
      "label": "Email address",
      "value": "",
      "sendCodeButtonLabel": "Try again.",
      "sendCodeSubmissionMessage": "Didn't receive your code?",
      "codeSentMessage": "Code sent",
      "rules": [
        {
          "active": true,
          "name": "required",
          "value": true,
          "errorMessage": "Please enter a valid email address.",
          "events": [
            "blur",
            "submit"
          ]
        },
        {
          "name": "stringLength",
          "value": {
            "min": 0,
            "max": 255
          },
          "errorMessage": "Please enter a valid email address.",
          "events": [
            "blur",
            "submit"
          ]
        },
        {
          "name": "matchPattern",
          "value": {
            "pattern": "^[-a-zA-Z0-9~!$%^&*_=+}{\\'?]+(\\.[-a-zA-Z0-9~!$%^&*_=+}{\\'?]+)*@([a-zA-Z0-9][-a-zA-Z0-9]*(\\.[-a-zA-Z0-9]+)*\\.([a-zA-Z0-9]+)|([0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}))(:[0-9]{1,5})?$"
          },
          "errorMessage": "Please enter a valid email address.",
          "events": [
            "blur",
            "submit"
          ]
        }
      ]
    },
    "verifyCode": {
      "type": "verifyCode",
      "label": "Enter Code",
      "rules": [
        {
          "name": "required",
          "value": true,
          "errorMessage": "Please enter a valid code",
          "events": [
            "blur",
            "submit"
          ]
        }
      ]
    },
    "verifyMobileNumber": {
      "dataField": "phone",
      "type": "internationalMobileNumber",
      "keyboardType": "tel",
      "value": "",
      "tip": "Please enter a valid mobile number.",
      "placeholder": "Mobile Number",
      "label": "Mobile Number",
      "supportedList": [
        {
          "country": "AE",
          "text": "United Arab Emirates",
          "code": "971"
        },
        {
          "country": "AU",
          "text": "Australia",
          "code": "61"
        },
        {
          "country": "AT",
          "text": "Austria",
          "code": "43"
        },
        {
          "country": "BE",
          "text": "Belgium",
          "code": "32"
        },
        {
          "country": "BG",
          "text": "Bulgaria",
          "code": "359"
        },
        {
          "country": "CA",
          "text": "Canada",
          "code": "1"
        },
        {
          "country": "CH",
          "text": "Switzerland",
          "code": "41"
        },
        {
          "country": "CL",
          "text": "Chile",
          "code": "56"
        },
        {
          "country": "CZ",
          "text": "Czech Republic",
          "code": "420"
        },
        {
          "country": "DE",
          "text": "Germany",
          "code": "49"
        },
        {
          "country": "DK",
          "text": "Denmark",
          "code": "45"
        },
        {
          "country": "EG",
          "text": "Egypt",
          "code": "20"
        },
        {
          "country": "ES",
          "text": "Spain",
          "code": "34"
        },
        {
          "country": "FI",
          "text": "Finland",
          "code": "358"
        },
        {
          "country": "FR",
          "text": "France",
          "code": "33"
        },
        {
          "country": "GB",
          "text": "United Kingdom",
          "code": "44"
        },
        {
          "country": "GR",
          "text": "Greece",
          "code": "30"
        },
        {
          "country": "HR",
          "text": "Croatia (local name: Hrvatska)",
          "code": "385"
        },
        {
          "country": "HU",
          "text": "Hungary",
          "code": "36"
        },
        {
          "country": "ID",
          "text": "Indonesia",
          "code": "62"
        },
        {
          "country": "IE",
          "text": "Ireland",
          "code": "353"
        },
        {
          "country": "IL",
          "text": "Israel",
          "code": "972"
        },
        {
          "country": "IN",
          "text": "India",
          "code": "91"
        },
        {
          "country": "IT",
          "text": "Italy",
          "code": "39"
        },
        {
          "country": "JP",
          "text": "Japan",
          "code": "81"
        },
        {
          "country": "LU",
          "text": "Luxembourg",
          "code": "352"
        },
        {
          "country": "MA",
          "text": "Morocco",
          "code": "212"
        },
        {
          "country": "MX",
          "text": "Mexico",
          "code": "52"
        },
        {
          "country": "MY",
          "text": "Malaysia",
          "code": "60"
        },
        {
          "country": "NL",
          "text": "Netherlands",
          "code": "31"
        },
        {
          "country": "NO",
          "text": "Norway",
          "code": "47"
        },
        {
          "country": "NZ",
          "text": "New Zealand",
          "code": "64"
        },
        {
          "country": "PH",
          "text": "Philippines",
          "code": "63"
        },
        {
          "country": "PL",
          "text": "Poland",
          "code": "48"
        },
        {
          "country": "PR",
          "text": "Puerto Rico",
          "code": "1"
        },
        {
          "country": "PT",
          "text": "Portugal",
          "code": "351"
        },
        {
          "country": "RO",
          "text": "Romania",
          "code": "40"
        },
        {
          "country": "RU",
          "text": "Russian Federation",
          "code": "7"
        },
        {
          "country": "SA",
          "text": "Saudi Arabia",
          "code": "966"
        },
        {
          "country": "SE",
          "text": "Sweden",
          "code": "46"
        },
        {
          "country": "SG",
          "text": "Singapore",
          "code": "65"
        },
        {
          "country": "SI",
          "text": "Slovenia",
          "code": "386"
        },
        {
          "country": "SK",
          "text": "Slovakia (Slovak Republic)",
          "code": "421"
        },
        {
          "country": "TH",
          "text": "Thailand",
          "code": "66"
        },
        {
          "country": "TR",
          "text": "Turkey",
          "code": "90"
        },
        {
          "country": "TW",
          "text": "Taiwan",
          "code": "886"
        },
        {
          "country": "US",
          "text": "United States",
          "code": "1"
        },
        {
          "country": "VN",
          "text": "Vietnam",
          "code": "84"
        },
        {
          "country": "ZA",
          "text": "South Africa",
          "code": "27"
        }
      ],
      "rules": [
        {
          "name": "required",
          "value": true,
          "errorMessage": "Please enter a valid mobile number.",
          "events": [
            "blur",
            "change",
            "submit"
          ]
        },
        {
          "name": "stringLength",
          "value": {
            "min": 8,
            "max": 15
          },
          "errorMessage": "Please enter a valid mobile number.",
          "events": [
            "blur",
            "change",
            "submit"
          ]
        },
        {
          "name": "matchPattern",
          "value": {
            "pattern": "^[0-9]+$"
          },
          "errorMessage": "Please enter a valid mobile number.",
          "events": [
            "blur",
            "change",
            "submit"
          ]
        }
      ]
    },
    "verifyMobilePhoneNumber": {
      "dataField": "phone",
      "type": "verifyMobileNumber",
      "keyboardType": "tel",
      "value": "",
      "tip": "Please enter a valid mobile number.",
      "sendCodePhoneNumberInputLabel": "Mobile Number",
      "sendCodeButtonLabel": "Send Code",
      "sendCodeSubmissionMessage": "Didn't receive your code? Try again in {{seconds}} seconds.",
      "verifyCodeCodeInputLabel": "Enter Code",
      "supportedList": [
        {
          "country": "AE",
          "text": "United Arab Emirates",
          "code": "971"
        },
        {
          "country": "AT",
          "text": "Austria",
          "code": "43"
        },
        {
          "country": "AU",
          "text": "Australia",
          "code": "61"
        },
        {
          "country": "BE",
          "text": "Belgium",
          "code": "32"
        },
        {
          "country": "BG",
          "text": "Bulgaria",
          "code": "359"
        },
        {
          "country": "CA",
          "text": "Canada",
          "code": "1"
        },
        {
          "country": "CH",
          "text": "Switzerland",
          "code": "41"
        },
        {
          "country": "CL",
          "text": "Chile",
          "code": "56"
        },
        {
          "country": "CZ",
          "text": "Czech Republic",
          "code": "420"
        },
        {
          "country": "DE",
          "text": "Germany",
          "code": "49"
        },
        {
          "country": "DK",
          "text": "Denmark",
          "code": "45"
        },
        {
          "country": "EG",
          "text": "Egypt",
          "code": "20"
        },
        {
          "country": "ES",
          "text": "Spain",
          "code": "34"
        },
        {
          "country": "FI",
          "text": "Finland",
          "code": "358"
        },
        {
          "country": "FR",
          "text": "France",
          "code": "33"
        },
        {
          "country": "GB",
          "text": "United Kingdom",
          "code": "44"
        },
        {
          "country": "GR",
          "text": "Greece",
          "code": "30"
        },
        {
          "country": "HR",
          "text": "Croatia (local name: Hrvatska)",
          "code": "385"
        },
        {
          "country": "HU",
          "text": "Hungary",
          "code": "36"
        },
        {
          "country": "ID",
          "text": "Indonesia",
          "code": "62"
        },
        {
          "country": "IE",
          "text": "Ireland",
          "code": "353"
        },
        {
          "country": "IL",
          "text": "Israel",
          "code": "972"
        },
        {
          "country": "IN",
          "text": "India",
          "code": "91"
        },
        {
          "country": "IT",
          "text": "Italy",
          "code": "39"
        },
        {
          "country": "JP",
          "text": "Japan",
          "code": "81"
        },
        {
          "country": "LU",
          "text": "Luxembourg",
          "code": "352"
        },
        {
          "country": "MA",
          "text": "Morocco",
          "code": "212"
        },
        {
          "country": "MX",
          "text": "Mexico",
          "code": "52"
        },
        {
          "country": "MY",
          "text": "Malaysia",
          "code": "60"
        },
        {
          "country": "NL",
          "text": "Netherlands",
          "code": "31"
        },
        {
          "country": "NO",
          "text": "Norway",
          "code": "47"
        },
        {
          "country": "NZ",
          "text": "New Zealand",
          "code": "64"
        },
        {
          "country": "PH",
          "text": "Philippines",
          "code": "63"
        },
        {
          "country": "PL",
          "text": "Poland",
          "code": "48"
        },
        {
          "country": "PR",
          "text": "Puerto Rico",
          "code": "1"
        },
        {
          "country": "PT",
          "text": "Portugal",
          "code": "351"
        },
        {
          "country": "RO",
          "text": "Romania",
          "code": "40"
        },
        {
          "country": "RU",
          "text": "Russian Federation",
          "code": "7"
        },
        {
          "country": "SA",
          "text": "Saudi Arabia",
          "code": "966"
        },
        {
          "country": "SE",
          "text": "Sweden",
          "code": "46"
        },
        {
          "country": "SG",
          "text": "Singapore",
          "code": "65"
        },
        {
          "country": "SI",
          "text": "Slovenia",
          "code": "386"
        },
        {
          "country": "SK",
          "text": "Slovakia (Slovak Republic)",
          "code": "421"
        },
        {
          "country": "TH",
          "text": "Thailand",
          "code": "66"
        },
        {
          "country": "TR",
          "text": "Turkey",
          "code": "90"
        },
        {
          "country": "TW",
          "text": "Taiwan",
          "code": "886"
        },
        {
          "country": "US",
          "text": "United States",
          "code": "1"
        },
        {
          "country": "VN",
          "text": "Vietnam",
          "code": "84"
        },
        {
          "country": "ZA",
          "text": "South Africa",
          "code": "27"
        }
      ],
      "rules": {
        "sendCode": [
          {
            "name": "required",
            "value": true,
            "errorMessage": "Please enter a valid mobile number.",
            "events": [
              "blur",
              "change",
              "submit"
            ]
          },
          {
            "name": "stringLength",
            "value": {
              "min": 8,
              "max": 15
            },
            "errorMessage": "Please enter a valid mobile number.",
            "events": [
              "blur",
              "change",
              "submit"
            ]
          },
          {
            "name": "matchPattern",
            "value": {
              "pattern": "^[0-9]+$"
            },
            "errorMessage": "Please enter a valid mobile number.",
            "events": [
              "blur",
              "change",
              "submit"
            ]
          }
        ],
        "verifyCode": [
          {
            "name": "required",
            "value": true,
            "errorMessage": "Please enter a valid code",
            "events": [
              "blur",
              "submit"
            ]
          }
        ]
      }
    },
    "code": {
      "dataField": "code",
      "type": "textInput",
      "keyboardType": "number",
      "tip": "Please enter a valid code",
      "value": "",
      "placeholder": "Enter Code",
      "label": "Enter Code",
      "rules": [
        {
          "name": "required",
          "value": true,
          "errorMessage": "Please enter a valid code",
          "events": [
            "blur",
            "submit"
          ]
        }
      ]
    },
    "sendCodeSubmit": {
      "type": "submitButton",
      "label": "SEND CODE",
      "labelProcessing": "PROCESSING…",
      "formId": "progressiveForm",
      "actions": {
        "submit": "progressiveSubmit"
      }
    },
    "isMobileVerifiedSubmit": {
      "type": "submitButton",
      "label": "CONTINUE",
      "labelProcessing": "PROCESSING…",
      "formId": "progressiveForm"
    },
    "migrationProgressiveHeader": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">Help us serve you better</div><div class=\"view-sub-header\">We have unified your Nike accounts. Before continuing, please review and verify your account data.</div></header>"
    },
    "captureProgressiveHeader": {
      "type": "block",
      "value": "<header>{{headerImage}}<div class=\"view-header\">Help us serve you better</div></header>"
    },
    "progressiveSubmit": {
      "type": "submitButton",
      "label": "CONTINUE",
      "labelProcessing": "PROCESSING…",
      "formId": "progressiveForm"
    },
    "progressiveSubmitWithSkip": {
      "type": "submitButton",
      "label": "CONTINUE",
      "labelProcessing": "PROCESSING…",
      "formId": "progressiveForm"
    },
    "progressiveSkipButton": {
      "type": "actionButton",
      "label": "SKIP",
      "view": "progressive",
      "action": "skip"
    },
    "currentMemberSignIn": {
      "type": "actionLink",
      "classes": [
        "nike-unite-component",
        "action-link",
        "current-member-signin"
      ],
      "label": "Already a member?",
      "view": "login",
      "linkText": "Sign in."
    },
    "currentMemberSocialLink": {
      "type": "actionLink",
      "classes": [
        "nike-unite-component",
        "action-link",
        "current-member-signin"
      ],
      "label": "Already a member?",
      "view": "link",
      "linkText": "Sign in."
    },
    "currentMemberMobileSocialLink": {
      "type": "actionLink",
      "classes": [
        "nike-unite-component",
        "action-link",
        "current-member-signin"
      ],
      "label": "Already a member?",
      "view": "mobileLink",
      "linkText": "Sign in."
    },
    "currentMobileNumberMemberSignIn": {
      "type": "actionLink",
      "classes": [
        "nike-unite-component",
        "action-link",
        "current-member-signin"
      ],
      "label": "Already a member?",
      "view": "mobileLogin",
      "linkText": "Sign in."
    },
    "resetUserPasswordLogIn": {
      "type": "actionLink",
      "classes": [
        "nike-unite-component",
        "action-link",
        "current-member-signin"
      ],
      "label": "Or return to",
      "view": "login",
      "linkText": "Log In."
    },
    "mobileResetUserPasswordLogIn": {
      "type": "actionLink",
      "classes": [
        "nike-unite-component",
        "action-link",
        "current-member-signin"
      ],
      "label": "Or return to",
      "view": "mobileLogin",
      "linkText": "Log In."
    },
    "progressNumberLink": {
      "type": "actionLink",
      "classes": [
        "nike-unite-component",
        "action-link",
        "progressive-number-link"
      ],
      "label": "Didn’t get your code?",
      "view": "progressive",
      "linkText": "Try again."
    },
    "verifyCodeLink": {
      "type": "actionLink",
      "classes": [
        "nike-unite-component",
        "action-link",
        "verify-code-link"
      ],
      "label": "Already have a code?",
      "view": "mobileVerificationCode",
      "linkText": "Enter it here."
    },
    "mobileNumberToEmailLoginLink": {
      "type": "actionLink",
      "classes": [
        "nike-unite-component",
        "action-link",
        "toggle-action-link"
      ],
      "label": "",
      "view": "login",
      "linkText": "Use email to log in."
    },
    "linkMobileNumberToEmailLink": {
      "type": "actionLink",
      "classes": [
        "nike-unite-component",
        "action-link",
        "toggle-action-link"
      ],
      "label": "",
      "view": "link",
      "linkText": "Use email to log in."
    },
    "mobileNumberToEmailResetPasswordLink": {
      "type": "actionLink",
      "classes": [
        "nike-unite-component",
        "action-link",
        "toggle-action-link"
      ],
      "label": "",
      "view": "resetPassword",
      "linkText": "Use email to reset password."
    },
    "mobileNumberToEmailReauthLink": {
      "type": "actionLink",
      "classes": [
        "nike-unite-component",
        "action-link",
        "toggle-action-link"
      ],
      "label": "",
      "view": "reauth",
      "linkText": "Use email to log in."
    },
    "nikeSwoosh": {
      "type": "block",
      "value": "<div class=\"nike-unite-swoosh\"></div>"
    },
    "thundercatImage": {
      "type": "block",
      "value": "<div class=\"nike-unite-thundercat\"></div>"
    },
    "partnerImage": {
      "type": "block",
      "value": "<div></div>"
    }
  }
});