/*!
 * Piwik - free/libre analytics platform
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */
(function () {
    angular.module('piwikApp').controller('PersonalSettingsController', PersonalSettingsController);

    PersonalSettingsController.$inject = ['piwikApi', '$window', 'piwik', '$q'];

    function PersonalSettingsController(piwikApi, $window, piwik, $q) {
        // remember to keep controller very simple. Create a service/factory (model) if needed

        var self = this;

        this.doesRequirePasswordConfirmation = false;
        this.showTokenAuthDeferred = null;

        function updateSettings(postParams)
        {
            self.loading = true;

            piwikApi.withTokenInUrl();
            piwikApi.post({
                module: 'UsersManager', action: 'recordUserSettings', format: 'json'
            }, postParams).then(function (success) {
                var UI = require('piwik/UI');
                var notification = new UI.Notification();
                notification.show(_pk_translate('CoreAdminHome_SettingsSaveSuccess'), {
                    id: 'PersonalSettingsSuccess', context: 'success'});
                notification.scrollToNotification();

                self.doesRequirePasswordConfirmation = !!self.password;
                self.passwordCurrent = '';
                self.loading = false;
            }, function (errorMessage) {
                self.loading = false;
                self.passwordCurrent = '';
            });
        }

        this.requirePasswordConfirmation = function () {
            this.doesRequirePasswordConfirmation = true;
        };

        this.regenerateTokenAuth = function () {
            var parameters = { userLogin: piwik.userLogin };

            self.loading = true;

            piwikHelper.modalConfirm('#confirmTokenRegenerate', {yes: function () {
                piwikApi.withTokenInUrl();
                piwikApi.post({
                    module: 'API',
                    method: 'UsersManager.regenerateTokenAuth'
                }, parameters).then(function (success) {
                    $window.location.reload();
                    self.loading = false;
                }, function (errorMessage) {
                    self.loading = false;
                });
            }});
        };

        this.cancelSave = function () {
            this.passwordCurrent = '';
        };

        this.save = function () {

            if (this.doesRequirePasswordConfirmation && !this.passwordCurrent) {
                angular.element('#confirmChangesWithPassword').openModal({ dismissible: false, ready: function () {
                    $('.modal.open #currentPassword').focus();
                }});
                return;
            }

            angular.element('#confirmChangesWithPassword').closeModal();

            var postParams = {
                email: this.email,
                defaultReport: this.defaultReport == 'MultiSites' ? this.defaultReport : this.site.id,
                defaultDate: this.defaultDate,
                language: this.language,
                timeformat: this.timeformat,
            };

            if (this.password) {
                postParams.password = this.password;
            }

            if (this.passwordBis) {
                postParams.passwordBis = this.passwordBis;
            }

            if (this.passwordCurrent) {
                postParams.passwordConfirmation = this.passwordCurrent;
            }

            updateSettings(postParams);
        };

        this.onShowTokenAuth = function () {
            this.showTokenAuthDeferred = $q.defer();

            angular.element('#confirmPasswordForTokenAuth').openModal({
                dismissible: false, ready: function () {
                    $('.modal.open #currentPassword').focus();
                }
            });

            return this.showTokenAuthDeferred.promise;
        };

        this.getMyTokenAuth = function() {
            var self = this;

            piwikApi.post({
                method: 'UsersManager.getMyTokenAuth'
            }, {
                passwordConfirmation: self.passwordCurrentForTokenAuth
            }).then(function (response) {
                angular.element('#confirmPasswordForTokenAuth').closeModal();

                self.showTokenAuthDeferred.resolve(response.value);
            });
        };
    }
})();
