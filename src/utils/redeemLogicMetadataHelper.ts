import metadata from 'configs/redeemLogicMetadata.json';
import { MetadataDetails } from 'models/MetadataDetail';
import { RLPluginTypeIds } from 'models/plugins/redeemLogic/RLStateType';

export function getRedeemLogicDocumentionLink(id: RLPluginTypeIds): string {
	const data = metadata.redeemLogicMetadata as MetadataDetails;
	return data[id].documentationLink;
}

export function getRedeemLogicSourceCodeLink(id: RLPluginTypeIds): string {
	const data = metadata.redeemLogicMetadata as MetadataDetails;
	return data[id].sourceCodeLink;
}

export function getRedeemLogicDescription(id: RLPluginTypeIds): string {
	const data = metadata.redeemLogicMetadata as MetadataDetails;
	return data[id].description;
}
