import { XPathOJP } from "../../../helpers/xpath-ojp"

export interface BookingArrangement {
    agencyCode: string,
    agencyName: string,
    infoURL: string,
}

export class ServiceBooking {
  public bookingArrangements: BookingArrangement[]

  constructor(bookingArrangements: BookingArrangement[]) {
    this.bookingArrangements = bookingArrangements;
  }

  public static initWithContextNode(contextNode: Node): ServiceBooking | null {
    const bookingArrangementsNodes = XPathOJP.queryNodes('ojp:service/ojp:BookingArrangements/ojp:BookingArrangement', contextNode);
    if (bookingArrangementsNodes.length === 0) {
        debugger;
        return null;
    }

    const bookingArrangements: BookingArrangement[] = [];
    bookingArrangementsNodes.forEach(bookingNode => {
        const agencyCode = XPathOJP.queryText('ojp:BookingAgencyName/ojp:Text', bookingNode);
        let infoURL = XPathOJP.queryText('ojp:InfoUrl', bookingNode);

        if ((agencyCode === null) || (infoURL === null)) {
            return;
        }

        infoURL = infoURL.trim();
        
        if (infoURL.length < 2) {
            return null;
        }
        // strip out <>
        infoURL = infoURL.substring(1, infoURL.length - 1);

        var el = document.createElement('textarea');
        el.innerHTML = infoURL.trim();
        infoURL = el.innerText;

        bookingArrangements.push({
            agencyCode: agencyCode.trim(),
            agencyName: ServiceBooking.computeAgencyName(agencyCode),
            infoURL: infoURL,
        });
    });

    const serviceBooking = new ServiceBooking(bookingArrangements);
    
    return serviceBooking;
  }

  private static computeAgencyName(agencyCode: string): string {
    agencyCode = agencyCode.trim();
    if (agencyCode === 'catalog_taxi_local.ch') {
      return 'local.ch';
    }
    if (agencyCode === 'catalog_taxi_maps.google.ch') {
      return 'maps.google.com';
    }
    if (agencyCode === 'catalog_taxi_openstreetmap.org') {
      return 'openstreetmap.org';
    }

    return 'n/a catalog';
  }
}
