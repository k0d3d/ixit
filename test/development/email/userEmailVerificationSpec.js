/*global describe it expect*/

describe("email template test for user verification", function () {

    it("should be able to send a test email using the user verification template", function () {

        // arrange
        var sendTemplateEmail = require('../../../lib/email/sendMessage.js').sendTemplateEmail;

        // act
        sendTemplateEmail("jjaffe@its-your-internet.com", "jjaffe@its-your-internet.com", "test email for user verification", "views/email-templates/user-email-verification.jade", {
            verificationLink: "http://107.170.59.140:8080/email-verification/?verifyuser=1923jj2kj3kj3kj3"
        }).then(function() {

            // assert
            expect(true).toBe(true);

        }).
        catch (function(exception) {

            // assert
            expect(exception).toBe(undefined);

            // fail
            console.error('couldn\'t send email');
            console.error(exception);

        });

    });
    
});