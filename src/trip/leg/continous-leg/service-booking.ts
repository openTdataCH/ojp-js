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
        console.error('ERROR - no BookingArrangements nodes found');
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
            return;
        }
        // strip out <>
        if (infoURL[0] === '<') {
          infoURL = infoURL.substring(1, infoURL.length - 1);
        }

        var el = document.createElement('textarea');
        el.innerHTML = infoURL.trim();
        infoURL = el.innerText;

        const bookingArrangement: BookingArrangement = {
          agencyCode: agencyCode.trim(),
          agencyName: ServiceBooking.computeAgencyName(agencyCode),
          infoURL: infoURL,
        };

        bookingArrangements.push(bookingArrangement);
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
