import metadata from 'configs/payoffMetadata.json';
import { PayoffTypeIds } from 'models/common';
import { MetadataDetails } from 'models/MetadataDetail';

export function getPayoffDocumentionLink(id: PayoffTypeIds): string {
	const data = metadata.payoffMetadata as MetadataDetails;
	return data[id].documentationLink;
}

export function getPayoffSourceCodeLink(id: PayoffTypeIds): string {
	const data = metadata.payoffMetadata as MetadataDetails;
	return data[id].sourceCodeLink;
}

export function getPayoffDescription(id: PayoffTypeIds): string {
	const data = metadata.payoffMetadata as MetadataDetails;
	return data[id].description;
}
