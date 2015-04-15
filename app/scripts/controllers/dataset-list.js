'use strict';

/**
 * @ngdoc function
 * @name sgisApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sgisApp
 */
angular.module('sgisApp')
  .controller('DatasetListController', ['$scope','datasetList','sharedTagService','envService',function ($scope,datasetList,sharedTagService,envService) {
    /*local scope accessible by anonymous functions*/
    var datasetListCtrl = this;
    /*function inside here is done when query returns*/
  	datasetListCtrl.datasets = datasetList.query(function() {
      var temp = datasetListCtrl.datasets;
      datasetListCtrl.datasets = datasetListCtrl.datasets.results;
      var recursiveLoad = function(num){
        temp = datasetList.query({page:num},function(){
          for (var i = 0; i < temp.results.length;i++){
            temp.results[i]['active'] = false;
          }
          datasetListCtrl.datasets = datasetListCtrl.datasets.concat(temp.results);
          if (temp.next != null){
            recursiveLoad(num+1);
          }
        });
      };
      for (var i = 0; i < datasetListCtrl.datasets.length;i++){
        datasetListCtrl.datasets[i]['active'] = false;
      }
      if (temp.next!=null){
        recursiveLoad(2);
      }
    });
  	datasetListCtrl.activeTags = sharedTagService.getTagList();

  	datasetListCtrl.toggleActivatedDataset = function (datasetIndex){
  		if (datasetListCtrl.datasets[datasetIndex].active) {
  		/*just activated, this is tied to checkbox*/
  			sharedTagService.addTags(datasetListCtrl.datasets[datasetIndex]);
        envService.addActiveDataset(datasetIndex);
	  	} else {
        sharedTagService.removeTags(datasetListCtrl.datasets[datasetIndex]);
        envService.removeActiveDataset(datasetIndex);
	  	}
  	};

  }]);