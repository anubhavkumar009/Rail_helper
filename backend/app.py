import requests
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

class IRCTC:

    BASE_URL = os.getenv("RAILRADAR_BASE_URL", "https://api.railradar.in/v1")
    API_KEY = os.getenv("RAILRADAR_API_KEY", "")

    def __init__(self):

        while True:

            user_input=input('''\n\n
                    ========================================
                    INDIAN RAILWAY SYSTEM
                    ========================================

                    1. Live Train Status
                    2. Train Schedule
                    3. Trains Between Stations
                    4. Seat Availability
                    5. Search Station
                    6. Station Trains
                    7. Station Live Board
                    8. Exit

                    Enter your choice: ''')

            if user_input=="1":
                self.live_train_status()

            elif user_input=="2":
                self.train_schedule()

            elif user_input=="3":
                self.trains_between_stations()

            elif user_input=="4":
                self.seat_availability()

            elif user_input=="5":
                self.search_station()

            elif user_input=="6":
                self.station_trains()

            elif user_input=="7":
                self.station_live_board()

            elif user_input=="8":
                print("Thank you!")
                break

            else:
                print("Invalid choice!")


    def request(self,url,params=None):

        headers={
            "Authorization":f"Bearer {self.API_KEY}"
        }

        response=requests.get(
            url,
            headers=headers,
            params=params
        )

        print("\nStatus Code:",response.status_code)

        if response.status_code==200:
            return response.json()

        else:
            print("Error:",response.text)
            return None


    # --------------------------------
    # 1. LIVE TRAIN STATUS
    # --------------------------------

    def live_train_status(self):

        train_number=input("Enter Train Number: ")

        url=f"{self.BASE_URL}/trains/{train_number}/live"

        data=self.request(url)

        if data:
            data=data['data']

            trainNo=data.get('trainNumber','Not Available')
            trainName=data.get('trainName','Not Available')

            train=data.get('train',{})

            type=train.get('type','Not Available')
            category=train.get('category','Not Available')

            source=train.get('source',{}).get('name','Not Available')
            destination=train.get('destination',{}).get('name','Not Available')

            status=data.get('status','Not Available')

            currentLocation=data.get('currentLocation',{})
            curr=currentLocation.get('stationName','Not Available')
            delay=currentLocation.get('delayMinutes','Not Available')

            prev=data.get('previousHalt',{}).get('stationName','Not Available')
            next_stop=data.get('nextHalt',{}).get('stationName','Not Available')

            lastUpdate=data.get('lastUpdatedAt','Not Available')

            coach=train.get('coachPosition','Not Available')

            if lastUpdate!='Not Available':
                date=lastUpdate.split('T')[0]
                time=lastUpdate.split('T')[1].split('+')[0]
            else:
                date='Not Available'
                time='Not Available'    

            print("Train Number:",trainNo)
            print("Train Name:",trainName)
            print("Type:",type)
            print("Category:",category)
            print("Source:",source)
            print("Destination:",destination)

            print("\nStatus:",status)
            print("Current Location:",curr)
            print("Delay:",delay,"minutes")

            if prev!='Not Available':
                print("Previous Stop:",prev)

            if next_stop!='Not Available':
                print("Next Stop:",next_stop)

            print("\nLast Updated At:","Date-",date,"Time-",time)
            print("Coaches Position:",coach)
            



    # --------------------------------
    # 2. TRAIN SCHEDULE
    # --------------------------------


    def train_schedule(self):

        train_number=input("Enter Train Number: ")

        url=f"{self.BASE_URL}/legacy/trains/{train_number}"

        params={"dataType":"full"}

        data=self.request(url,params)

        if data:

            data=data['data']

            train=data['train']
            stations=data['route']

            trainNo=train.get('trainNumber','Not Available')
            trainName=train.get('trainName','Not Available')
            trainType=train.get('type','Not Available')

            source=train.get('sourceStationName','Not Available')
            destination=train.get('destinationStationName','Not Available')

            distance=train.get('distanceKm','Not Available')
            totalHalts=train.get('totalHalts','Not Available')

            print("\n========================================")
            print("TRAIN INFORMATION")
            print("========================================")

            print("Train Number:",trainNo)
            print("Train Name:",trainName)
            print("Type:",trainType)
            print("Source:",source)
            print("Destination:",destination)
            print("Distance:",distance,"KM")
            print("Total Halts:",totalHalts)

            print("\n========================================")
            print("TRAIN SCHEDULE")
            print("========================================")

            for station in stations:

                sequence=station.get('sequence','N/A')
                code=station.get('stationCode','N/A')
                name=station.get('stationName','N/A')

                arrival=station.get('scheduledArrival','N/A')
                departure=station.get('scheduledDeparture','N/A')

                arrival='N/A' if arrival=='N/A' else self.convert_time(arrival)
                departure='N/A' if departure=='N/A' else self.convert_time(departure)

                distance=station.get('distanceFromSourceKm','N/A')

                print("\nSequence:",sequence)
                print("Station:",name)
                print("Code:",code)
                print("Arrival:",arrival)
                print("Departure:",departure)
                print("Distance:",distance,"KM")

    # --------------------------------
    # 3. TRAINS BETWEEN STATIONS
    # --------------------------------

    def trains_between_stations(self):

        source=input("Enter Source Station Code: ").upper()
        source=self.get_station_code(source)

        destination=input("Enter Destination Station Code: ").upper()
        destination=self.get_station_code(destination)

        url=f"{self.BASE_URL}/trains/between/{source}/{destination}"

        data=self.request(url)

        if data:

            data=data['data']

            count=data.get('count',0)
            trains=data.get('trains',[])

            if count>0:

                print("\nTotal Trains Found:",count)

                for t in trains:

                    train=t.get('train',{})

                    number=train.get('number','N/A')
                    name=train.get('name','N/A')
                    train_type=train.get('type','N/A')
                    days=train.get('runDays',[])

                    start=t.get('from',{})
                    end=t.get('to',{})

                    distance=t.get('distance','N/A')
                    stoppage=t.get('totalHaltsBetween','N/A')

                    print("\n========================================")
                    print("Train Name:",name)
                    print("Train Number:",number)
                    print("Type:",train_type)

                    print("Running Days:",end=" ")
                    for d in days:
                        print(d,end=" ")

                    print("\nFrom:",start.get('name','N/A'),"- City:",start.get('city','N/A'))
                    print("To:",end.get('name','N/A'),"- City:",end.get('city','N/A'))

                    print("Distance:",distance,"KM")
                    print("Total Number of Stoppages:",stoppage)

            else:
                print("\nNo trains found between these stations.")

    # --------------------------------
    # 4. SEAT AVAILABILITY
    # --------------------------------

    def seat_availability(self):

        train_number=input("Enter Train Number: ")

        source=input("Enter Source Station Code: ").upper()
        source=self.get_station_code(source)

        destination=input("Enter Destination Station Code: ").upper()
        destination=self.get_station_code(destination)

        journey_date=input("Enter Journey Date (YYYY-MM-DD): ")

        print("Class Codes: 1A-First AC, 2A-AC 2 Tier, 3A-AC 3 Tier, 3E-AC 3 Economy, CC-AC Chair Car, SL-Sleeper, 2S-Second Sitting")
        class_code=input("Enter Class Code(1A, 2A, 3A, 3E, CC, SL, 2S): ").upper()

        print("Quota Codes: GN-General, TQ-Tatkal, PT-Premium Tatkal, LD-Ladies, SS-Senior Citizen")
        
        quota_code=input("Enter Quota Code(GN, TQ, PT, LD, SS): ").upper()

        url=f"{self.BASE_URL}/trains/{train_number}/seats"

        params={
            "source":source,
            "destination":destination,
            "journeyDate":journey_date,
            "classCode":class_code,
            "quotaCode":quota_code
        }

        data=self.request(url,params)

        if data and isinstance(data, dict) and 'data' in data:
            data=data['data']
            calendar=data.get('calendar',[]) if isinstance(data, dict) else []

            for d in calendar:

                print("\n========================================")

                date=d.get('rawDate','N/A')
                status=d.get('statusCode','N/A')

                print("Date:",date)
                print("Status:",status)

                if status=="AVAILABLE":
                    seat=d.get('availableSeats','N/A')
                    print("Available Seats:",seat)

                elif status=="WAITLIST" or status=="RAC":
                    listnumber=d.get('waitlistNumber','N/A')
                    print("Waitlist Number:",listnumber)
        else:
            print("\n[NOTE] Live IRCTC Seat Availability now requires a paid Developer/Growth plan on RailRadar.")
            print("If you are on a free tier API key, live seat queries are restricted by RailRadar.")


    # --------------------------------
    # 5. SEARCH STATION
    # --------------------------------

    def search_station(self):

        query=input("Enter Station Name/Code: ")

        url=f"{self.BASE_URL}/lookup/search/stations"

        params={
            "q":query,
            "limit":10
        }

        data=self.request(url,params)

        if data:
            data=data['data']
            for st in data:

                code=st.get('code','NULL')
                name=st.get('name','NULL')
                city=st.get('city','NULL')
                active=st.get('isActive',False)

                if active:
                    print("\n========================================")
                    print("Station Code:",code)
                    print("Station Name:",name)
                    print("City:",city)



    # --------------------------------
    # 6. STATION TRAINS
    # --------------------------------

    def station_trains(self):

        station_code=input("Enter Station Code: ").upper()
        station_code=self.get_station_code(station_code)

        url=f"{self.BASE_URL}/stations/{station_code}/trains"

        data=self.request(url)

        if not data:
            return

        data=data.get('data',{})

        station=data.get('station',{})
        trains=data.get('trains',[])

        print("\n========================================")
        print("STATION INFORMATION")
        print("========================================")

        print("Station Name:",station.get('name','N/A'))
        print("Station Code:",station.get('code','N/A'))
        print("City:",station.get('city','N/A'))

        print("\nTotal Trains Found:",len(trains))

        page_size=10

        for i in range(0,len(trains),page_size):

            print("\nShowing trains",i+1,"-",min(i+page_size,len(trains)),"of",len(trains))

            for item in trains[i:i+page_size]:

                train=item.get('train',{})
                stop=item.get('stop',{})

                number=train.get('number','N/A')
                name=train.get('name','N/A')
                train_type=train.get('type','N/A')

                source=train.get('source',{}).get('name','N/A')
                destination=train.get('destination',{}).get('name','N/A')

                days=train.get('runDays',[])

                arrival=stop.get('arrival')
                departure=stop.get('departure')
                distance=stop.get('distance','N/A')
                stop_type=stop.get('stopType','N/A')

                print("\n========================================")
                print("Train Name:",name)
                print("Train Number:",number)
                print("Type:",train_type)
                print("Source:",source)
                print("Destination:",destination)

                print("Running Days:",end=" ")
                for day in days:
                    print(day,end=" ")

                print()

                if arrival:
                    print("Arrival:",arrival)

                if departure:
                    print("Departure:",departure)

                print("Distance from Source:",distance,"KM")
                print("Stop Type:",stop_type)

            if i+page_size<len(trains):
                choice=input("\nPress ENTER for next 10 trains or type Q to quit: ")

                if choice.upper()=="Q":
                    break


    # --------------------------------
    # 7. STATION LIVE BOARD
    # --------------------------------

    def station_live_board(self):

        station_code=input("Enter Station Code: ").upper()
        station_code=self.get_station_code(station_code)

        url=f"{self.BASE_URL}/stations/{station_code}/live"

        params={
            "hours":4
        }

        data=self.request(url,params)

        if not data:
            return

        data=data.get('data',{})

        station=data.get('station',{})
        window=data.get('window',{})
        trains=data.get('trains',[])

        print("\n========================================")
        print("STATION LIVE BOARD")
        print("========================================")

        print("Station:",station.get('name','N/A'))
        print("Station Code:",station.get('code','N/A'))
        print("City:",station.get('city','N/A'))

        print("\nTime Window:",window.get('from','N/A'),"to",window.get('to','N/A'))
        print("Total Trains:",len(trains))

        page_size=10

        for i in range(0,len(trains),page_size):

            print("\nShowing trains",i+1,"-",min(i+page_size,len(trains)),"of",len  (trains))

            for item in trains[i:i+page_size]:

                train=item.get('train',{})
                stop=item.get('stop',{})
                live=item.get('live',{})

                number=train.get('number','N/A')
                name=train.get('name','N/A')
                train_type=train.get('type','N/A')

                arrival=stop.get('arrival')
                departure=stop.get('departure')
                platform=stop.get('platform') or 'N/A'

                status=live.get('type','N/A')
                status=status.replace('-',' ').title()

                delay=live.get('delayMinutes','N/A')

                expected_arrival=live.get('expectedArrivalTime')
                expected_departure=live.get('expectedDepartureTime')

                print("\n========================================")
                print("Train Name:",name)
                print("Train Number:",number)
                print("Type:",train_type)

                if arrival:
                    print("Scheduled Arrival:",arrival)

                if departure:
                    print("Scheduled Departure:",departure)

                if expected_arrival:
                    expected_time=expected_arrival.split('T')[1].split('+')[0]
                    print("Expected Arrival:",expected_time)

                if expected_departure:
                    expected_time=expected_departure.split('T')[1].split('+')[0]
                    print("Expected Departure:",expected_time)

                print("Platform:",platform)
                print("Live Status:",status)

                if delay!="N/A":

                    if delay>0:
                        print("Delay:",delay,"minutes")

                    elif delay<0:
                        print("Early by:",abs(delay),"minutes")

                    else:
                        print("Status: On Time")

            if i+page_size<len(trains):

                choice=input("\nPress ENTER for next 10 trains or type Q to quit: ")

                if choice.upper()=="Q":
                    break



    def convert_time(self,minutes):

        if minutes is None:
            return "N/A"

        hours=minutes//60
        mins=minutes%60

        return f"{hours:02d}:{mins:02d}"


    def get_station_code(self,station):

        url=f"{self.BASE_URL}/lookup/search/stations"

        params={
            "q":station,
            "limit":1
        }

        data=self.request(url,params)

        if not data:
            return "NULL"

        data=data.get('data',[])

        if data:
            return data[0].get('code','NULL')

        else:
            return "NULL"


obj=IRCTC()