"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { IconStar, IconMapPin, IconCheck } from "@tabler/icons-react";

interface Candidate {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  imageUrl?: string;
  skills: string[];
  matchingSkills: string[];
  experienceLevel?: string;
  relevantProjects: Array<{
    id: string;
    title: string;
    skills: string[];
    state: string;
  }>;
  score: number;
}

export function JobCreation({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Candidate[]>([]);
  const [showingRecommendations, setShowingRecommendations] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    positionType: '',
    requiredSkills: [] as string[],
    preferredExperience: '',
    budgetMin: '',
    budgetMax: '',
    currency: 'USD',
    isNegotiable: true,
    location: '',
    isRemote: true,
    duration: '',
  });

  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter(s => s !== skill),
    });
  };

  const fetchRecommendations = async () => {
    if (formData.requiredSkills.length === 0) {
      toast.error("Skills required", {
        description: "Please add at least one required skill to get candidate recommendations.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/hirer/candidates/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requiredSkills: formData.requiredSkills,
          preferredExperience: formData.preferredExperience || null,
          positionType: formData.positionType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data.candidates || []);
      setShowingRecommendations(true);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error("Error", {
        description: "Failed to get candidate recommendations.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.positionType) {
      toast.error("Required fields missing", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    if (formData.requiredSkills.length === 0) {
      toast.error("Skills required", {
        description: "Please add at least one required skill.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/hirer/job-postings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : null,
          budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : null,
          status: 'PUBLISHED',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create job posting');
      }

      toast.success("Success!", {
        description: "Job posting created successfully.",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        positionType: '',
        requiredSkills: [],
        preferredExperience: '',
        budgetMin: '',
        budgetMax: '',
        currency: 'USD',
        isNegotiable: true,
        location: '',
        isRemote: true,
        duration: '',
      });
      setRecommendations([]);
      setShowingRecommendations(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating job posting:', error);
      toast.error("Error", {
        description: "Failed to create job posting.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0).toUpperCase() || '';
    const last = lastName?.charAt(0).toUpperCase() || '';
    return first + last || 'U';
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              placeholder="e.g., Senior Frontend Developer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description <span className="text-destructive">*</span></Label>
            <Textarea
              id="description"
              placeholder="Describe the role, responsibilities, and requirements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-32"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="positionType">Position Type <span className="text-destructive">*</span></Label>
              <Select
                value={formData.positionType}
                onValueChange={(value) => setFormData({ ...formData, positionType: value })}
                required
              >
                <SelectTrigger id="positionType">
                  <SelectValue placeholder="Select position type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREELANCER">Freelancer</SelectItem>
                  <SelectItem value="INTERNSHIP">Internship</SelectItem>
                  <SelectItem value="JOB">Full-time Job</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredExperience">Preferred Experience Level</Label>
              <Select
                value={formData.preferredExperience}
                onValueChange={(value) => setFormData({ ...formData, preferredExperience: value })}
              >
                <SelectTrigger id="preferredExperience">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                  <SelectItem value="EXPERT">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Required Skills <span className="text-destructive">*</span></Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill (e.g., React, Python)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button type="button" onClick={handleAddSkill} variant="outline">
                Add
              </Button>
            </div>
            {formData.requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {formData.requiredSkills.length > 0 && (
            <Button
              type="button"
              onClick={fetchRecommendations}
              variant="outline"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Finding Candidates...' : 'Get Top 3 Candidate Recommendations'}
            </Button>
          )}
        </div>

        {/* Recommendations */}
        {showingRecommendations && recommendations.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Top 3 Recommended Candidates</CardTitle>
              <CardDescription>
                These candidates match your requirements based on their skills and previous work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.map((candidate) => (
                <Card key={candidate.id} className="bg-background">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={candidate.imageUrl} />
                        <AvatarFallback>{getInitials(candidate.firstName, candidate.lastName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">
                              {candidate.firstName && candidate.lastName
                                ? `${candidate.firstName} ${candidate.lastName}`
                                : 'Anonymous'}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <IconStar className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm font-medium">{candidate.score}% match</span>
                              {candidate.experienceLevel && (
                                <Badge variant="secondary" className="text-xs">
                                  {candidate.experienceLevel}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {candidate.matchingSkills.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="default" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        {candidate.relevantProjects.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {candidate.relevantProjects.length} relevant project{candidate.relevantProjects.length !== 1 ? 's' : ''} completed
                          </p>
                        )}
                      </div>
                      <IconCheck className="h-5 w-5 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Compensation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budgetMin">Min Budget/Compensation (USD)</Label>
            <Input
              id="budgetMin"
              type="number"
              placeholder="e.g., 500"
              value={formData.budgetMin}
              onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budgetMax">Max Budget/Compensation (USD)</Label>
            <Input
              id="budgetMax"
              type="number"
              placeholder="e.g., 5000"
              value={formData.budgetMax}
              onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
            />
          </div>
        </div>

        {/* Location & Remote */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., New York, NY or Remote"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              placeholder="e.g., 3 months, Full-time"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isRemote"
            checked={formData.isRemote}
            onCheckedChange={(checked) => setFormData({ ...formData, isRemote: checked === true })}
          />
          <Label htmlFor="isRemote" className="cursor-pointer">
            Remote position
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isNegotiable"
            checked={formData.isNegotiable}
            onCheckedChange={(checked) => setFormData({ ...formData, isNegotiable: checked === true })}
          />
          <Label htmlFor="isNegotiable" className="cursor-pointer">
            Budget/Compensation is negotiable
          </Label>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => {
            setFormData({
              title: '',
              description: '',
              positionType: '',
              requiredSkills: [],
              preferredExperience: '',
              budgetMin: '',
              budgetMax: '',
              currency: 'USD',
              isNegotiable: true,
              location: '',
              isRemote: true,
              duration: '',
            });
            setRecommendations([]);
            setShowingRecommendations(false);
          }}>
            Reset
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Publish Job Posting'}
          </Button>
        </div>
      </form>
    </div>
  );
}

