import metadata from 'configs/redeemLogicMetadata.json';
import { PayoffTypeIds } from 'models/common';
import { MetadataDetails } from 'models/MetadataDetail';

export function getRedeemLogicDocumentionLink(id: PayoffTypeIds): string {
	const data = metadata.redeemLogicMetadata as MetadataDetails;
	return data[id].documentationLink;
}

export function getRedeemLogicSourceCodeLink(id: PayoffTypeIds): string {
	const data = metadata.redeemLogicMetadata as MetadataDetails;
	return data[id].sourceCodeLink;
}

export function getRedeemLogicDescription(id: PayoffTypeIds): string {
	const data = metadata.redeemLogicMetadata as MetadataDetails;
	return data[id].description;
}
