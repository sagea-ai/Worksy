"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  IconStar, 
  IconMapPin, 
  IconClock,
  IconCurrencyDollar,
  IconMail
} from "@tabler/icons-react";

interface Talent {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  imageUrl?: string;
  skills: string[];
  matchingSkills: string[];
  matchScore: number;
  skillOverlap: number;
  experienceLevel?: string;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  availability?: string;
  bio?: string;
  location?: string;
}

export function TalentPool() {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTalents();
  }, []);

  const fetchTalents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/hirer/talent-pool');
      
      // Handle non-200 responses gracefully
      if (!response.ok) {
        // For 403 or other errors, show empty state instead of error
        if (response.status === 403) {
          setTalents([]);
          return;
        }
        throw new Error(`Failed to fetch talents: ${response.statusText}`);
      }

      const data = await response.json();
      // Always set talents array, even if empty
      setTalents(data.talents || []);
    } catch (err) {
      console.error('Error fetching talents:', err);
      // Set empty array instead of error so component can still render
      setTalents([]);
      setError(null); // Don't show error, just show empty state
    } finally {
      setLoading(false);
    }
  };

  const getExperienceColor = (level?: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-blue-500';
      case 'INTERMEDIATE': return 'bg-green-500';
      case 'ADVANCED': return 'bg-purple-500';
      case 'EXPERT': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0).toUpperCase() || '';
    const last = lastName?.charAt(0).toUpperCase() || '';
    return first + last || 'U';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (talents.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          No matching talents found. Update your hiring needs in your profile to see candidates.
        </p>
        <Button variant="outline" onClick={() => window.location.href = '/profile'}>
          Update Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {talents.map((talent) => (
        <Card key={talent.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={talent.imageUrl} />
                <AvatarFallback>{getInitials(talent.firstName, talent.lastName)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {talent.firstName && talent.lastName
                        ? `${talent.firstName} ${talent.lastName}`
                        : 'Anonymous Talent'}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      {talent.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <IconMapPin className="h-4 w-4" />
                          {talent.location}
                        </div>
                      )}
                      {talent.experienceLevel && (
                        <Badge 
                          variant="secondary" 
                          className={getExperienceColor(talent.experienceLevel)}
                        >
                          {talent.experienceLevel}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-sm">
                        <IconStar className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{talent.matchScore}% match</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <IconMail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>

                {talent.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{talent.bio}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {talent.matchingSkills.slice(0, 5).map((skill) => (
                    <Badge key={skill} variant="default" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {talent.matchingSkills.length > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{talent.matchingSkills.length - 5} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  {talent.hourlyRateMin && talent.hourlyRateMax && (
                    <div className="flex items-center gap-1">
                      <IconCurrencyDollar className="h-4 w-4" />
                      ${talent.hourlyRateMin}-${talent.hourlyRateMax}/hr
                    </div>
                  )}
                  {talent.availability && (
                    <div className="flex items-center gap-1">
                      <IconClock className="h-4 w-4" />
                      {talent.availability}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

