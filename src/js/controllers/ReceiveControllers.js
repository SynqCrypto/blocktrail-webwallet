angular.module('blocktrail.wallet')
    .controller('ReceiveCtrl', function($scope, $rootScope, Wallet, CurrencyConverter, $q, $timeout, $translate) {
        $rootScope.pageTitle = 'RECEIVE';

        $scope.paymentReceived       = false;

        $scope.address      = null;
        $scope.path         = null;
        $scope.bitcoinUri   = null;
        $scope.qrcode       = null;
        $scope.translations = null;
        $scope.newRequest   = {
            address: null,
            path: null,
            btcValue: 0,
            fiatValue: 0,
            message: null,
            bitcoinUri: ""
        };

        $scope.qrSettings   = {
            correctionLevel: 7,
            SIZE: 225,
            inputMode: 'M',
            image: true
        };

        $scope.translations     = null;
        $scope.getTranslations  = function(params) {
            //always get a fresh translation if params are provided
            if ($scope.translations && !params) {
                return $q.when($scope.translations);
            } else {
                var requiredTranslations = [
                    'OK',
                    'CANCEL',
                    'ERROR',
                    'CONTACTS_FILTER_TITLE',
                    'CONTACTS_SHOW_ALL',
                    'CONTACTS_WALLETS_ONLY',
                    'CONTACTS_RESYNC',
                    'MSG_CONTACTS_PERMISSIONS',
                    'PERMISSION_REQUIRED_CONTACTS',
                    'MSG_INVITE_CONTACT',
                    'MSG_REQUEST_EMAIL_SUBJECT_1',
                    'MSG_REQUEST_EMAIL_SUBJECT_2',
                    'MSG_REQUEST_EMAIL_BODY_1',
                    'MSG_REQUEST_EMAIL_BODY_2',
                    'MSG_REQUEST_SMS_1',
                    'MSG_REQUEST_SMS_2'
                ];
                return $translate(requiredTranslations, params).then(function(translations) {
                    $scope.translations = translations;
                    return $q.when(translations);
                });
            }
        };

        $scope.swapInputs = function() {
            $scope.fiatFirst = !$scope.fiatFirst;
        };

        $scope.currencies   = null;
        $scope.currencyType = null;
        $scope.altCurrency  = {};
        $scope.updateCurrentType = function(currencyType) {
            $scope.currencies = $rootScope.currencies.slice();
            $scope.currencies.unshift({code: 'BTC', 'symbol': 'BTC'});
            $scope.currencies = $scope.currencies.filter(function(currency) {
                return currency.code != currencyType;
            });

            $scope.currencyType = currencyType;

            $scope.setAltCurrency();

        };

        $scope.setAltCurrency = function() {
             if ($scope.currencyType == 'BTC') {
                $scope.altCurrency.code     = $scope.settings.localCurrency;
                $scope.altCurrency.amount   = parseFloat(CurrencyConverter.fromBTC($scope.newRequest.btcValue, $scope.settings.localCurrency, 2)) || 0;
            } else {
                $scope.altCurrency.code     = 'BTC';
                $scope.altCurrency.amount   = parseFloat(CurrencyConverter.toBTC($scope.newRequest.btcValue, $scope.currencyType, 6)) || 0;
            }
        };

        // set default BTC
        $scope.updateCurrentType('BTC');

        $scope.newAddress = function() {
            $scope.newRequest.address = null;

            $q.when(Wallet.getNewAddress()).then(function(address) {
                $scope.newRequest.address = address;
            });
        };

        $scope.generateQR = function() {
            if (!$scope.newRequest.address) {
                return false;
            }

            $scope.newRequest.bitcoinUri = "bitcoin:" + $scope.newRequest.address;
            $scope.newRequest.qrValue = 0;
            if ($scope.currencyType=='BTC') {
                $scope.newRequest.qrValue = parseFloat($scope.newRequest.btcValue);
            } else {
                $scope.newRequest.qrValue = parseFloat($scope.altCurrency.amount);
            }

            if ($scope.newRequest.btcValue) {
                $scope.newRequest.bitcoinUri += "?amount=" + parseFloat($scope.newRequest.qrValue).toFixed(8);
            }
        };

        //update the URI and QR code when address or value change
        $scope.$watchGroup(['newRequest.btcValue', 'newRequest.address', 'currencyType'], function(newValues, oldValues) {
            if (oldValues != newValues) {
                //ignore call from scope initialisation
                $scope.generateQR();
            }
        });

        //generate the first address
        $scope.newAddress();


        $scope.$on('new_transactions', function(event, transactions) {
            //show popup (and maybe vibrate?) on new tx
            $scope.paymentReceived = true;

            //$log.debug('New Transaction have been found!!!', transactions);
            transactions.forEach(function(transaction) {

            });
        });
    })
;
