import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconCalendar } from "@tabler/icons-react"

export default function EventsPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
        <div className="flex items-center space-x-3 mb-6">
          <IconCalendar className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Events & Calendar</h1>
            <p className="text-muted-foreground">
              View your schedule and teammate availability
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>
                  Your schedule and upcoming events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <IconCalendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg">
                    Calendar integration coming soon
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    View your schedule and coordinate with teammates
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No events today</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Availability</CardTitle>
                <CardDescription>
                  See when your teammates are available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No team members yet</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  )
}
