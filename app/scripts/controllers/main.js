'use strict';

/**
 * @ngdoc function
 * @name socialjusticeApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the socialjusticeApp
 */
angular.module('socialjusticeApp')

  .controller('MainCtrl',function ($scope,$http,$routeParams,
                                $modal,$resource,$timeout, 
                                dataSource, dataFeed,dataEdit,
                                djResource,polygonService,tagService,
                                tagFiltering,locationService) 
    {
    // GoogleMapApi.then(function(maps) {
    //     $scope.googleVersion = maps.version;
    // maps.visualRefresh = true;
    // $log.info('$scope.map.rectangle.bounds set');
    // $scope.map.rectangle.bounds = new maps.LatLngBounds(
    //     new maps.LatLng(55,-100),
    //     new maps.LatLng(49,-78)
    // );
    // });
    var google = window.google;
    $scope.sources = dataSource.query();
    $scope.data = {};
    $scope.dataShow={};
    $scope.Id=1;
    $scope.dataDuplicate = {};
    $scope.savetheState=false;
    $scope.dataTemp={};
    $scope.boundsChangedFlag=0;
    $scope.halt=0;
    $scope.doCluster=false;
    $scope.innerarray=[];
    $scope.selectedSource={};
    $scope.selectedSourceDisabled={};  // reprsents the sources selected in the checkbox
    $scope.temp=[];
    $scope.pageFeed=1;
    $scope.dataTag = {};
    $scope.dataSourceId=1;
    $scope.dataset1={};
    $scope.dset1={};
    $scope.dataset2={};
    $scope.dset2={};
    $scope.dataset3={};
    $scope.dataLocation=[];
    $scope.pageNum=1;
    $scope.pagePolygon=1;
    $scope.dset3={};
    $scope.multiTags=[];
    $scope.tagObject={};
    $scope.polyData1=[];
    $scope.maxLon=0;
    $scope.minLon=0;
    $scope.maxLat=0;
    $scope.minLat=0;
    $scope.matchModel='any';
    $scope.singleModel = false;
    $scope.selectedTagUrl='';
    $scope.clusterFunc=function(){
        $scope.doCluster=!$scope.doCluster;
    };
    $scope.saveState=function(){
        if(document.getElementById('but1').innerHTML==='Resume'){
            document.getElementById('but1').innerHTML='Save';
        }else{
            document.getElementById('but1').innerHTML='Resume';
        }
        $scope.savetheState=!$scope.savetheState;
    };
    $scope.saveTag=function(){
        $scope.dataTag={
            id:$scope.tagObject.id,
            nameTag:$scope.tagObject.nameTag,
            descriptionTag:$scope.tagObject.descriptionTag,
            outputTagSelect:$scope.tagObject.outputTagSelect,
            addNewTag:$scope.tagObject.addNewTag
        };
        var tagId=$scope.dataTag.id;
        $scope.Poll={};
        var temp=$resource('http://107.170.106.235/api-mp/:id/',{id:tagId});
        temp.get({id:tagId})
        .$promise.then(function(tagobj){
            $scope.Poll=tagobj;
            $scope.Poll.readByUser=true;
        });
        $scope.Poll.tags=$scope.dataTag.outputTagSelect;
        console.log($scope.dataTag.outputTagSelect);
        for(var k in $scope.dataTag.outputTagSelect){
          $scope.product={};
          $scope.product.mappoint=tagId;
          $scope.product.tag=$scope.dataTag.outputTagSelect[k].id;
          var product =new dataEdit($scope.product);
          console.log($scope.dataTag.outputTagSelect[k].id);
          console.log($scope.product.mappoint);
          product.$create();
        }
    };
  //=================================================
  $scope.drawingManagerOptions = {
    drawingMode: google.maps.drawing.OverlayType.MARKER,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.MARKER,
          google.maps.drawing.OverlayType.CIRCLE,
          google.maps.drawing.OverlayType.POLYGON,
          google.maps.drawing.OverlayType.POLYLINE,
          google.maps.drawing.OverlayType.RECTANGLE
        ]
    },
    circleOptions: {
      fillColor: '#ffff00',
        fillOpacity: 0.2,
        strokeWeight: 0.7,
        clickable: false,
        editable: true,
        zIndex: 1
      }
    };
  $scope.markersAndCircleFlag = true;
  $scope.drawingManagerControl = {};
  $scope.$watch('markersAndCircleFlag', function() {
    if (!$scope.drawingManagerControl.getDrawingManager) {
      return;
    }
    var controlOptions = angular.copy($scope.drawingManagerOptions);
    if (!$scope.markersAndCircleFlag) {
      controlOptions.drawingControlOptions.drawingModes.shift();
      controlOptions.drawingControlOptions.drawingModes.shift();
    }
    $scope.drawingManagerControl.getDrawingManager().setOptions(controlOptions);
  });
  //=================================================================
     //Showing TagsModal info window
        var tagsModal = $modal({scope: $scope, template: 'views/modal/tags.html', show: false});
        $scope.makeModal = function(markerkey) {
        $scope.Id=1;
        var index=1;
        console.log($scope.data);
        for(index in $scope.data){
            var temp=$scope.data[index];
            for(var j in temp){
                if(markerkey===temp[j].id){
                    $scope.Id=index;
                    $scope.tagObject.nameTag=temp[j].name;
                    $scope.tagObject.descriptionTag=temp[j].city;
                    $scope.tagObject.id=temp[j].id;
                    console.log($scope.tagObject.id);
                    $scope.tagObject.addNewTag=temp[j].tags;
                    $scope.tagObject.multiTags=temp[j].tags;
                    $scope.tagObject.outputTagSelect=temp[j].tags;
                    // console.log($scope.tagObject.outputTagSelect);
                     console.log('Tags');
                    // console.log($scope.multiTags.tags);
                    tagsModal.$promise.then(tagsModal.show);
                }
            }
        }
        var temp2=$scope.dataLocation;
        for(var f in temp2){
            if(markerkey===temp2[f].id){
                $scope.tagObject.nameTag=temp2[f].name;
                $scope.tagObject.descriptionTag=temp2[f].city;
                $scope.tagObject.id=temp2[f].id;
                $scope.tagObject.addNewTag=temp2[f].tags;
                $scope.tagObject.multiTags=temp2[f].tags;
                $scope.tagObject.outputTagSelect=temp2[f].tags;
                console.log('Tags');
                tagsModal.$promise.then(tagsModal.show);
            }
        }     
    };
    $scope.loadTags = function(query) {
        console.log(query);
        return tagService.query({Id:$scope.Id}).$promise;
    };
   
    $scope.selectedTag = '';
    $scope.states = ['fruits', 'vegetables', 'organic vegetables', 'bus accessible', 'local foods'];
    $scope.isEmpty=function(obj) 
    { 
        for(var prop in obj)
        { 
            if(obj.hasOwnProperty(prop)) {
                return false; 
            }
        }
        return true;
    };
    $scope.Default=function(){
        $scope.dataDuplicate=$scope.data;
    };

   
    $scope.getViewPortBounds=function(){

        var bounds =  $scope.map.control.getGMap().getBounds();
        var lat0 = bounds.getNorthEast().lat();
        var lng0 = bounds.getNorthEast().lng();
        var lat1 = bounds.getSouthWest().lat();
        var lng1 = bounds.getSouthWest().lng();
        console.log(bounds);
        console.log(lat0);
        console.log(lng0);
        console.log(lat1);
        console.log(lng1);
    };
    $scope.checkFilter=function(){
            $scope.selectedTagUrl='';

            for(var m=0 ;m<=$scope.selectedTag.length-2;m++){
                $scope.selectedTagUrl=$scope.selectedTagUrl+$scope.selectedTag[m].tag+',';
            }
            $scope.selectedTagUrl=$scope.selectedTagUrl+
            $scope.selectedTag[$scope.selectedTag.length-1].tag;
            console.log($scope.selectedTagUrl);
            
        for(var a in $scope.dataDuplicate){ 
        console.log($scope.dataDuplicate[a]);  
            if($scope.isEmpty($scope.dataDuplicate[a])){
                console.log('Null');
            }
            else{ 
                console.log('value of a '+a);
                var filterData1=tagFiltering.query({
                                selectedTag:$scope.selectedTagUrl,
                                dataId:a, matchModel:$scope.matchModel
                            },
                                function(){
                                    $scope.dataDuplicate[a]=filterData1;
                                    //console.log($scope.dataDuplicate[a]);
                                });
            }
        }
    };
    $scope.refresh=false;
    $scope.refreshMap=function(){
        console.log('refreshing the map');
        $scope.map.control.refresh({});
        $scope.map.control.getGMap().setZoom(7);
    };
    $scope.getMapInstance = function () {
        console.log($scope.map.control.getGMap());  // will give you the instance of the map
        //alert("You have Map Instance of" + $scope.map.control.getGMap().toString());
        return;
    };
    $scope.fillcolor={
        color:'#505250',
        opacity: 0.2
    };
    $scope.strokecolor={
        weight: 1,
        color: '#505250',
        opacity: 0.7
    };
    $scope.user={
        dataset:['dara']
    };
    $scope.checkAll = function() {
    };
    $scope.uncheckAll = function() {
        $scope.selectedSource = [];
    };
    $scope.onSelect = function(dataSourceId) {
        console.log(dataSourceId);
        $scope.pageFeed=1;
        $scope.dataSourceId=dataSourceId;
        if($scope.selectedSource[dataSourceId]===undefined ){
            $scope.selectedSourceDisabled[dataSourceId]=true;
            $scope.LoadPointsOnLocation(dataSourceId);
        }   
        else if($scope.selectedSource[dataSourceId]===false ){
            $scope.dataShow[dataSourceId]=$scope.data[dataSourceId];
            $scope.data[dataSourceId]=[];
            console.log($scope.data[dataSourceId]);
            console.log('clicking input box again');
            $scope.selectedSourceDisabled[dataSourceId]=true;
            $scope.LoadPointsOnLocation(dataSourceId);
        }
        else if($scope.selectedSource[dataSourceId]===true) {
            console.log('entered false statement'); //when unclicks the input button
            $scope.data[dataSourceId] =[];
            //$scope.dataShow[dataSourceId]={};
            //delete $scope.data[dataSourceId];
        } 
        };
    $scope.LoadPointsOnLocation=function(dataSourceId){
        if($scope.savetheState===true){
            console.log('saveState');
            return;
        }
        $scope.data[dataSourceId]=[];
        $scope.pageFeed=1;
        
        $scope.temp=dataFeed.query({
            minLat:$scope.minLat,
            minLon:$scope.minLon,
            maxLat:$scope.maxLat,
            maxLon:$scope.maxLon,    
            'dataSourceId':$scope.dataSourceId,
            'pageFeed':$scope.pageFeed
            }).$promise.then(function(data){
            console.log('DataSourceId',dataSourceId);
            q(data,dataSourceId);
        });
    };
    function q(data,dataSourceId) {
        $scope.selectedSourceDisabled[dataSourceId]=true;
        if($scope.savetheState===true){
            return;
        }
        console.log('you will never walk alone');
        var r=data.results.length; 
        if($scope.data[dataSourceId]!==undefined){
            var existingArray=[];
            existingArray = $scope.data[dataSourceId];
            console.log(existingArray);
            for(var i=0;i<r;i++){
                existingArray.push(data.results[i]);
            }
            $scope.data[dataSourceId] = existingArray;
            $scope.dataDuplicate[dataSourceId]= $scope.data[dataSourceId];
        }
        else{
            if(dataSourceId!==undefined){
                $scope.data[dataSourceId] = data.results;
                $scope.dataDuplicate[dataSourceId]= $scope.data[dataSourceId];
            }   
        }
        console.log(Math.ceil(data.count/400));
        console.log('***'+($scope.pageFeed));
        if(Math.ceil(data.count/100)<=$scope.pageFeed) {
            $scope.selectedSourceDisabled[dataSourceId]=false;
            console.log($scope.selectedSourceDisabled[dataSourceId]);
        }
        else{
            $scope.pageFeed=$scope.pageFeed+1;
            dataFeed.query({'dataSourceId':dataSourceId,
                            'pageFeed':$scope.pageFeed,
                            minLat:$scope.minLat,
                            minLon:$scope.minLon,
                            maxLat:$scope.maxLat,
                            maxLon:$scope.maxLon
            }).$promise.then(function(data){
                console.log('DataSourceIdInner',dataSourceId);
                q(data,dataSourceId);
                });
        }
    }
    $scope.result = '';
    $scope.options = null;
    $scope.details = '';
    $scope.newMark={};
     $scope.dataset5=[];
     // Location Services Starting Here
    $scope.LocationCheck=function(){
        $scope.pageNum=1;
        console.log('Location check'+$scope.halt);
        $scope.dataset5=[];
        $scope.halt=0;
        //$scope.dataLocation=[];
        console.log('after locationcheck'+$scope.halt);
        $scope.dataset5=locationService.query(
                            {
                                minLat:$scope.minLat,
                                minLon:$scope.minLon,
                                maxLat:$scope.maxLat,
                                maxLon:$scope.maxLon,
                                pageNum:$scope.pageNum
                            }).$promise.then(loc);
    };

    function loc(data) { 
        console.log('Loc loop'+$scope.halt);
        if($scope.halt===1){
            return;
        }
        var m=data.results.length;
        for(var i=0; i < m; i++) {
            $scope.dataLocation.push(data.results[i]);
            //console.log(data.results[i]);
        }

        if((data.count/100<=$scope.pageNum)){
            console.log('Reached null');
        }
        else{
            $scope.pageNum=$scope.pageNum+1;
            locationService.query(
                    {
                        minLat:$scope.minLat,
                        minLon:$scope.minLon,
                        maxLat:$scope.maxLat,
                        maxLon:$scope.maxLon,
                        pageNum:$scope.pageNum
                    }).$promise.then(loc);      
        }   
    }
    $scope.convertCoords= function(){
        $scope.maxLon=0;
        $scope.minLon=0;
        $scope.maxLat=0;
        $scope.minLat=0;
        $scope.newMark.location={
            latitude: $scope.details.geometry.location.k,
            longitude: $scope.details.geometry.location.B
        };
        $scope.map.center.latitude=$scope.newMark.location.latitude;
        $scope.map.center.longitude=$scope.newMark.location.longitude;
        //$scope.map.zoom=15;
        $scope.map.control.getGMap().setCenter(new google.maps.LatLng($scope.map.center.latitude,$scope.map.center.longitude));
        $scope.map.control.getGMap().setZoom(13);
        var bounds =  $scope.map.control.getGMap().getBounds();
        var zoomlevel=$scope.map.control.getGMap().getZoom();
        console.log(zoomlevel);
        console.log($scope.map.bounds);
        $scope.maxLat = bounds.getNorthEast().lat();
        $scope.maxLon = bounds.getNorthEast().lng();
        $scope.minLat = bounds.getSouthWest().lat();
        $scope.minLon = bounds.getSouthWest().lng();
        console.log( $scope.minLat);
        console.log( $scope.minLon);
        console.log( $scope.maxLat);
        console.log( $scope.maxLon);
        $scope.LocationCheck();
        $scope.polygoncheck=true;
        $scope.polygonFunc();
    };
    $scope.LoadingBounds= function(){
        $scope.halt=1;
        $scope.maxLon=0;
        $scope.minLon=0;
        $scope.maxLat=0;
        $scope.minLat=0;
        console.log('Bounds Changing'+$scope.halt);
        var bounds =  $scope.map.control.getGMap().getBounds();
        var zoomlevel=$scope.map.control.getGMap().getZoom();
        console.log(zoomlevel);
        console.log($scope.map.bounds);
        $scope.maxLat = bounds.getNorthEast().lat();
        $scope.maxLon = bounds.getNorthEast().lng();
        $scope.minLat = bounds.getSouthWest().lat();
        $scope.minLon = bounds.getSouthWest().lng();
        console.log( $scope.minLat);
        console.log( $scope.minLon);
        console.log( $scope.maxLat);
        console.log( $scope.maxLon);
        $scope.boundsChangedFlag=1;

        for (var i in $scope.data) {
            console.log($scope.data[i]);
            if($scope.selectedSource[i]===true){
                $scope.LoadPointsOnLocation(i);
                console.log('kkkk');
                console.log($scope.selectedSource[i]);
            }
        }
       
        if($scope.polygoncheck){
            $scope.polygonFunc();
        }
    };
    $scope.map = {
        control: {},
        bounds: {},
    	center: {
    	  	latitude: 42.678681,
    	  	longitude: -73.741265
    	},
        events:{
            idle:function(){
                console.log('bounds are changing');
                $scope.LoadingBounds();
            }
        },
    	zoom: 11,
    	options: {
    		streetViewControl: true,
    		panControl: true,
    		panControlOptions: {
    			position: google.maps.ControlPosition.TOP_RIGHT
    		},

    		zoomControl: true,
    		zoomControlOptions: {
				style: google.maps.ZoomControlStyle.LARGE,
				position: google.maps.ControlPosition.RIGHT_TOP
    		},
    		maxZoom: 20,
    		minZoom: 3
    	},
	    dragging: true
    }; 
    $scope.symbol={
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 5
    };
    $scope.tabs = [
        {
        'title': 'Charts',
        'content': 'Charts View will give an area to compare different data sets',
        'template': 'views/charts.html'
        },
        {
        'title': 'Draw',
        'content': 'You can draw you own own elements',
        'template': 'views/draw.html'
        },
        {
        'title': 'Add',
        'template': 'views/about.html',
        'content': 'Add'
        }
    ];
    // var onMarkerClicked = function (marker) {
    //     marker.showWindow = true;
    //     $scope.$apply();
    // };
    $scope.showWindow=false;
   
    $scope.editTagEvents={
        options:{
            draggable:true},
        events:{
            mouseover:function(marker){
                console.log(marker);
            },
             click:function(marker){
                console.log('dbl clicked');
                //var pos = marker.getPosition();
                console.log(marker);
                var markerKey=marker.key;
                $scope.makeModal(markerKey);
            }
        }
    };
    $scope.infoWindowWithCustomClass= {
        options: {
            boxClass: 'custom-info-window'
        }
    };
    $scope.image={
        farm:'./images/farmstand.png',
        home: './images/home.png',
        circle: './images/measle_blue.png',
        marker1:'./images/measle_blue.png'
    };
    $scope.hello=function(){
        window.alert('hello');
        $scope.$apply();
    };
    $scope.AddwithDescription=function(){
        $scope.editTodo=true;
        console.log('Hi');
    };
    $scope.polygoncheck=false;
    //Polygon Services Fetching
    $scope.showHidePoly=function(){
    $scope.polygoncheck=!$scope.polygoncheck;
        $scope.polygonFunc();
    };
    $scope.polygonFunc=function(){
        if($scope.savetheState===true){
            return;
        }
        $scope.polyData1=[];
        $scope.pagePolygon=1;
        var pol=[];

        if($scope.polygoncheck===false){
            $scope.polyData1=[];
            return;
        }
        pol=polygonService.query(
            {
                minLat:$scope.minLat,
                minLon:$scope.minLon,
                maxLat:$scope.maxLat,
                maxLon:$scope.maxLon,
                pagePoly:$scope.pagePolygon
            }).$promise.then(polyServiceCall); 
    };
    
    function polyServiceCall(dataPoly) { 
        if($scope.savetheState===true){
            return;
        }
        if($scope.polygoncheck===false){
            $scope.polyData1=[];
            return;
        }
        var m=dataPoly.results.length;
        for(var i=0; i < m; i++) {
            console.log('hello');
            console.log('$scope.polyData1',$scope.polyData1);
            console.log('dataPoly.results',dataPoly.results);
            console.log('dataPoly.results[i]',dataPoly.results[i]);
             $scope.polyData1.push(dataPoly.results[i]);
        }
        if((dataPoly.count/100)<=$scope.pagePolygon){
            console.log('reached null');
            return;
        }
        else{
            console.log('how many times');
            $scope.pagePolygon=$scope.pagePolygon+1;
            console.log('$scope.pagePolygon',$scope.pagePolygon);
            polygonService.query(
                {
                    minLat:$scope.minLat,
                    minLon:$scope.minLon,
                    maxLat:$scope.maxLat,
                    maxLon:$scope.maxLon,
                    pagePoly:$scope.pagePolygon
                }).$promise.then(polyServiceCall);     
        }
    }
    $scope.polygonEvents={       
    };
});
