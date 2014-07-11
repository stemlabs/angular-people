/// <reference path="Typings/angularjs/angular.d.ts" />
/// <reference path="Typings/jquery/jquery.d.ts" />
"use strict";
var MainApp;
(function (MainApp) {
    var Card = (function () {
        function Card(lastname, firstname, address1, email, homephone, imageurl) {
            this.lastname = lastname;
            this.firstname = firstname;
            this.address1 = address1;
            this.email = email;
            this.homephone = homephone;
            this.imageurl = imageurl;
        }
        return Card;
    })();
    MainApp.Card = Card;
    ;
    var AppController = (function () {
        function AppController($scope, dataService, azureDataService) {
            this.scope = $scope;
            this.dataService = dataService;
            this.menu = "main";

            azureDataService.addSource('https://angularpeoplev2.azure-mobile.net/', 'DDJpBYxoQEUznagCnyYNRYfkDxpYyz90', ['people']);
            dataService.addSource(azureDataService);

            dataService.connect(function () {
                console.log("Data Loaded.");
            }, this.scope, 4);
        }
        AppController.prototype.Sync = function () {
            this.dataService.getEntries(function (results) {
                for (var result in results) {
                    this.scope.$apply(this.scope[result] = results[result]);
                }
            });
        };

        AppController.prototype.Add = function (tableName, entity) {
            this.dataService.add(tableName, entity, function () {
                console.log("data added.");
                //updates the data after you add data
                //this.Sync();
            }, function () {
                console.log('Problem adding data.');
            });
            this.menu = "main";
        };

        AppController.prototype.Sort = function (sortbutton) {
            if (sortbutton == this.sortField) {
                this.ascending = !this.ascending;
            } else {
                this.ascending = true;
            }

            this.sortField = sortbutton;

            if (this.ascending) {
                this.directionalSort = '+' + this.sortField;
            } else {
                this.directionalSort = '-' + this.sortField;
            }

            console.log(this.directionalSort);
        };
        return AppController;
    })();
    MainApp.AppController = AppController;
})(MainApp || (MainApp = {}));

// Angular specifics
var app = angular.module('app', ['DataModule', 'AzureDataModule']);
app.controller('mycontroller', ['$scope', 'dataService', 'azureDataService', MainApp.AppController]);
