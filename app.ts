/// <reference path="Typings/angularjs/angular.d.ts" />
/// <reference path="Typings/jquery/jquery.d.ts" /> 

"use strict";

module MainApp
{
    export class Card 
    {
        lastname: string;
        firstname: string;
        address1: string;
        email: string;
        homephone: string;
        imageurl: string;
        constructor(lastname: string, firstname: string, address1: string, email: string, homephone: string, imageurl: string) 
        {
            this.lastname = lastname;
            this.firstname = firstname;
            this.address1 = address1;
            this.email = email;
            this.homephone = homephone;
            this.imageurl = imageurl;
        }
    };
    export class AppController 
    {
        public menu: string;
        public dataService;
        public scope;

        public ascending: boolean;
        public sortField: string;
        public directionalSort: string;

        public constructor($scope, dataService, azureDataService)
        {
            this.scope = $scope;
            this.dataService = dataService;
            this.menu = "main";

            azureDataService.addSource('https://angularpeoplev2.azure-mobile.net/', 'DDJpBYxoQEUznagCnyYNRYfkDxpYyz90', ['people']);
            dataService.addSource(azureDataService);

            dataService.connect(function () 
            {
                console.log("Data Loaded.");
            }, this.scope, 4);
        }

        public Add(tableName, entity)
        {
            
            this.dataService.add(tableName, entity, function () 
            {
                console.log("data added.");
            }, function () 
            {
                console.log('Problem adding data.');
            });
            this.menu = "main";
        }

        public Sort(sortbutton: string)
        {
            if(sortbutton == this.sortField)
            {
                this.ascending = !this.ascending;
            }
            else
            {
                this.ascending = true;
            }

            this.sortField = sortbutton;

            if (this.ascending) 
            {
                this.directionalSort = '+' + this.sortField;
            } 
            else 
            {
                this.directionalSort = '-' + this.sortField;
            }

            console.log(this.directionalSort);
        }
    }
}

// Angular specifics
var app = angular.module('app', ['DataModule', 'AzureDataModule']);
app.controller('mycontroller', ['$scope', 'dataService', 'azureDataService', MainApp.AppController]);