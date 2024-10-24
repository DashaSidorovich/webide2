sap.ui.define([
	] , function () {
		"use strict";

		return {

			numberUnit : function (sValue) {
				if (!sValue) {
					return "";
				}
				return parseFloat(sValue).toFixed(2);
			},
			
			modifiedFormatter(oDate){
				
			    const oDateFormatter = sap.ui.core.format.DateFormat.getInstance({
			        style: 'medium' 
			    });
			
			    return oDateFormatter.format(new Date(oDate));
			}
			
		};

	}
);