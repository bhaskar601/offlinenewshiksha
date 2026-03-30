import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import { getApiBaseUrl } from "@/lib/apiBase";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { BookOpen, Cloud } from 'lucide-react';
import axios from 'axios';
import { enqueueEntity, syncToServer } from '@/services/syncService';

const API_URL = getApiBaseUrl();

const Register: React.FC = () => {
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const { toast } = useToast();

  // Registration state
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [instituteId, setInstituteId] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === '1234' && adminPassword === '1234') {
      setIsAdminVerified(true);
    } else {
      toast({
        title: 'Access Denied',
        description: 'Invalid admin credentials',
        variant: 'destructive',
      });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !name || !phone || !password || !instituteId || (role === 'student' && !classLevel)) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    const payload = role === 'student'
      ? {
          studentId: id,
          name,
          phone,
          password,
          schoolId: instituteId,
          class: classLevel,
        }
      : {
          teacherId: id,
          name,
          phone,
          password,
          schoolId: instituteId,
        };

    const url = role === 'student'
      ? `${API_URL}/students`
      : `${API_URL}/teachers`;

    try {
      setIsLoading(true);
      await axios.post(url, payload);

      toast({
        title: 'Registration Successful',
        description: `${role === 'student' ? 'Student' : 'Teacher'} ${id} created successfully.`,
      });

      // Offline-first cloud sync queue (students only, backward compatible with existing backend)
      if (role === 'student') {
        enqueueEntity('students', {
          studentId: id,
          name,
          phone,
          schoolId: instituteId,
          class: classLevel,
        });
      }

      // Clear form
      setName('');
      setId('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setInstituteId('');
      setClassLevel('');
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error?.response?.data?.error || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    if (syncing) return;
    try {
      setSyncing(true);
      const result = await syncToServer();
      toast({
        title: "Sync complete",
        description: result.synced ? `Synced ${result.synced} record(s) to cloud.` : "Nothing to sync.",
      });
    } catch (err: any) {
      toast({
        title: "Sync failed",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    // <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
  <div className="min-h-screen bg-gray-50">
    <Header />

    <div className="flex items-center justify-center px-4 py-8">
      {/* <Card className="w-full max-w-md mx-auto"></Card> */}
      {/* <Header/> */}
      <Card className="w-full max-w-md mx-auto">
        {!isAdminVerified ? (
          <>
            <CardHeader className="space-y-1 flex flex-col items-center">
              <div className="flex items-center justify-center p-2 bg-primary/10 rounded-full mb-2">
                <BookOpen className="h-10 w-10 text-edu-blue" />
              </div>
              <CardTitle className="text-2xl text-center">Admin Access Required</CardTitle>
              <CardDescription className="text-center">
                Please enter admin credentials to proceed
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAdminLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    placeholder="Enter username"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button className="w-full" type="submit">Enter</Button>
              </CardFooter>
            </form>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1 flex flex-col items-center">
              <div className="flex items-center justify-center p-2 bg-primary/10 rounded-full mb-2">
                <BookOpen className="h-10 w-10 text-edu-blue" />
              </div>
              <CardTitle className="text-2xl text-center">Create an account</CardTitle>
              <CardDescription className="text-center">
                Register to start preparing for NMMS exam
              </CardDescription>
            </CardHeader>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <form onSubmit={handleRegisterSubmit} className="flex-1 min-w-0">
              <Tabs defaultValue="student" className="w-full" onValueChange={(value) => setRole(value as 'student' | 'teacher')}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="student">Student</TabsTrigger>
                  <TabsTrigger value="teacher">Teacher</TabsTrigger>
                </TabsList>

                <TabsContent value="student">
                  <CardContent className="space-y-4">
                    <InputBlock label="Student ID" value={id} setValue={setId} />
                    <InputBlock label="Full Name" value={name} setValue={setName} />
                    <InputBlock label="Phone" value={phone} setValue={setPhone} type="tel" />
                    <InputBlock label="Institute ID" value={instituteId} setValue={setInstituteId} />
                    <div className="space-y-2">
                      <Label>Class</Label>
                      <Select value={classLevel} onValueChange={setClassLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
  {/* <SelectItem value="6" className="bg-blue-600 text-white hover:bg-white hover:text-blue-600">
    Class 6
  </SelectItem>
  <SelectItem value="7" className="bg-blue-600 text-white hover:bg-white hover:text-blue-600">
    Class 7
  </SelectItem>
  <SelectItem value="8" className="bg-blue-600 text-white hover:bg-white hover:text-blue-600">
    Class 8
  </SelectItem> */}
  <SelectItem value="NMMS" className="bg-blue-600 text-white hover:bg-white hover:text-blue-600">
    NMMS
  </SelectItem>
  <SelectItem value="competitive" className="bg-blue-600 text-white hover:bg-white hover:text-blue-600">
    Competitive (English)
  </SelectItem>
</SelectContent>
                      </Select>
                    </div>
                    <InputBlock label="Password" value={password} setValue={setPassword} type="password" />
                    <InputBlock label="Confirm Password" value={confirmPassword} setValue={setConfirmPassword} type="password" />
                  </CardContent>
                </TabsContent>

                <TabsContent value="teacher">
                  <CardContent className="space-y-4">
                    <InputBlock label="Teacher ID" value={id} setValue={setId} />
                    <InputBlock label="Full Name" value={name} setValue={setName} />
                    <InputBlock label="Phone" value={phone} setValue={setPhone} type="tel" />
                    <InputBlock label="Institute ID" value={instituteId} setValue={setInstituteId} />
                    <InputBlock label="Password" value={password} setValue={setPassword} type="password" />
                    <InputBlock label="Confirm Password" value={confirmPassword} setValue={setConfirmPassword} type="password" />
                  </CardContent>
                </TabsContent>
              </Tabs>

              <CardFooter className="flex flex-col">
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? 'Registering...' : 'Register'}
                </Button>
              </CardFooter>
              </form>
              <div className="w-full sm:w-56">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-edu-blue" />
                    <p className="font-semibold text-gray-900">Cloud Sync</p>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Sync queued changes when internet is available.
                  </p>
                  <div className="mt-4">
                    <Button
                      type="button"
                      className="w-full rounded-xl"
                      variant="outline"
                      onClick={handleSync}
                      disabled={syncing}
                    >
                      {syncing ? "Syncing..." : "Sync Data"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  </div>
  );
};

const InputBlock = ({
  label,
  value,
  setValue,
  type = 'text',
}: {
  label: string;
  value: string;
  setValue: (val: string) => void;
  type?: string;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input
      type={type}
      placeholder={label}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      required
    />
  </div>
);

export default Register;
