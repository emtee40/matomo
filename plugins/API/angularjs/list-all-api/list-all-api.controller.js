/*!
 * Piwik - free/libre analytics platform
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

/*!
 * Piwik - free/libre analytics platform
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */
(function () {
    angular.module('piwikApp').controller('ListAllApiController', ListAllApiController);

    ListAllApiController.$inject = ['piwikApi', '$q'];

    function ListAllApiController(piwikApi, $q) {
        var self = this;

        this.showTokenAuthDeferred = null;

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
