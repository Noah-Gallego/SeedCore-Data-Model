'use client';

import { useState } from 'react';

// Accordion component for each FAQ question
function FAQAccordion({ question, children }: { question: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex justify-between items-center focus:outline-none"
        aria-label={`${question} - ${isOpen ? 'Click to collapse' : 'Click to expand'}`}
      >
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{question}</h3>
        <svg
          className={`w-6 h-6 text-indigo-600 dark:text-indigo-400 transform ${isOpen ? 'rotate-180' : ''} transition-transform duration-200`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-6 pt-0 text-gray-700 dark:text-gray-300">
          {children}
        </div>
      </div>
    </div>
  );
}

// Export a client component that contains the FAQ page content
export default function FAQPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-4xl font-extrabold sm:text-5xl mb-12 text-center bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
          Frequently Asked Questions
        </h1>

        <div className="space-y-16">
          {/* Teacher Accounts Section */}
          <section>
            <h2 className="text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-5">
              I am a private school teacher
            </h2>
            
            <div className="space-y-4">
              <FAQAccordion question="All about your teacher's account!">              
                <p className="mb-6">
                  At Beyond Measure, we celebrate the dedication and passion of private Christian school teachers. Our platform is designed to empower you by providing the tools and support needed to enrich your classrooms and inspire your students. By creating your teacher profile, you join a network of educators committed to fostering academic excellence and nurturing the next generation of leaders. Our user-friendly platform ensures you have seamless access to update your information, set your preferences, and manage your projects, all while staying connected with a community that shares your commitment to faith-based education.
                </p>
                
                <p className="mb-6">
                  To be eligible for a teacher profile on Beyond Measure, you must meet the following criteria:
                </p>
                
                <div className="pl-6 mb-6">
                  <p className="mb-2"><strong>Teacher Definition:</strong> You must be a teacher employed in an eligible position and fulfill all the criteria listed below:</p>
                  <ul className="list-disc pl-8 mb-4 space-y-2">
                    <li>Full-time employee of a PreK-12 501(c)(3) private Christian educational institution approved and verified by Beyond Measure.</li>
                    <li>Work directly with students at least 75% of the time.</li>
                    <li>Not hold the position of an administrator, paraprofessional, teacher's aide, substitute teacher, or student teacher.</li>
                  </ul>
                  <p>Additionally, no local law, regulation, or institutional policy should prohibit your use of the site. You must also obtain all necessary authorization from your educational institution or governing body to enter into this agreement.</p>
                </div>
                
                <p className="mb-6">
                  Once your teacher account is created, you can manage all your information within My Account, accessible from the drop-down menu next to your name. By selecting My Account, you can view and update your account information. To tailor your experience, select Preferences to adjust your personal grade and subject interests. These preferences help Beyond Measure make personalized suggestions based on your interests as an individual, rather than your role as a teacher. Make sure to scroll down and click Save Settings whenever you update your information!
                </p>
                
                <p>
                  You can create and manage current or past projects by selecting Projects on the drop-down tab under your name. If you choose to upload a profile photo - this photo will be displayed on all your projects. If you have any comments, questions, or concerns, please contact us at <a href="mailto:support@gobeyondmeasure.org" className="text-blue-600 dark:text-blue-400 hover:underline">support@gobeyondmeasure.org</a>.
                </p>
              </FAQAccordion>

              <FAQAccordion question="Is Beyond Measure only available to private school teachers?">
                <p>
                  At Beyond Measure, our mission is dedicated to supporting teachers employed by 501(c)(3) private Christian schools. We hold deep respect and appreciation for educators in the public sector, but our focus is on bridging the funding gap for private school teachers. Through our partnership with generous donors who are passionate about Christian education, we aim to provide the resources needed to enhance and enrich the learning experience for students in private Christian schools.
                </p>
              </FAQAccordion>

              <FAQAccordion question="Is Beyond Measure only available to schools with a 501(c)(3) status?">
                <p>
                  Yes, we can only send your crowdfunded donations to schools that are 501(c)(3) organizations or operate under a parent organization's 501(c)(3) status. Before you can create a project and start receiving donations, we will verify your school's eligibility.
                </p>
              </FAQAccordion>

              <FAQAccordion question="I don't see my school listed when I go to create my account.">
                <p className="mb-4">
                  If your school isn't listed in the School text box, you may need to register it. Don't worry; the process is quick and easy!
                </p>
                <p className="mb-4">
                  To register your school, click Add New School accessible by scrolling to the bottom of the School text box. Then, enter your school's information, including its name, address, and administrator's contact details.
                </p>
                <p className="mb-4">
                  Once we verify your school's 501(c)(3) status, you can start creating projects and requesting approval from our team! If your school administrator registers their account, they will manage the approval process for your projects.
                </p>
                <p>
                  If you believe your school is already registered, please contact us at <a href="mailto:support@gobeyondmeasure.org" className="text-blue-600 dark:text-blue-400 hover:underline">support@gobeyondmeasure.org</a>, and we'll be happy to check for you.
                </p>
              </FAQAccordion>

              <FAQAccordion question="How do I know if my school is verified?">
                <p className="mb-4">
                  If you've already created a teacher account, you can easily check if your school is verified by seeing if you can create projects. Simply sign in and click on the dropdown menu next to your name in the top right corner of the page. If Projects appears in the dropdown menu, your school is verified.
                </p>
                <p>
                  Feel free to reach out to us at <a href="mailto:support@gobeyondmeasure.org" className="text-blue-600 dark:text-blue-400 hover:underline">support@gobeyondmeasure.org</a> if you have any questions about your school's verification status.
                </p>
              </FAQAccordion>

              <FAQAccordion question="How do I create a project?">
                <p className="mb-4">
                  Once your teacher profile is activated, you can begin creating projects. To get started, click on the dropdown menu next to your name and select Projects. On the right side, click Create New Project, and proceed to fill out the information listed in the following steps.
                </p>
                <ol className="list-decimal pl-8 mb-4 space-y-2">
                  <li><strong>Details:</strong> You'll add your project's title, description, applicable subject area(s), and relevant photos that will appear on your project's page and when sharing on social media. We recommend using a creative title so it stands out to potential donors. Project descriptions should be specific, telling donors the purpose, objectives, materials needed, and impact on your students. See "What kind of photos are permitted to be uploaded?" below for tips and guidelines on the photos. Click Save and Continue to move on to the next step</li>
                  <li><strong>Needs:</strong> Here, you'll input the number of students in your class, your fund goal, the types of materials you will purchase, and the last day you'll accept donations. In your fund goal, be sure to include expenses such as taxes and shipping fees. Click Save and Continue to move on to the final step.</li>
                  <li><strong>Confirmation:</strong> After completing steps 1 and 2, you'll be asked to review your project's information. When you are ready, click Submit to send it to our team for approval. If your school's administrator has an active account on Beyond Measure, they will manage your project approvals.</li>
                </ol>
                <p className="mb-4">
                  If you need to exit the project creation page before submitting, click Save and Close. This will save your project as a draft in your account.
                </p>
                <p>
                  For any assistance, feel free to contact us at <a href="mailto:support@gobeyondmeasure.org" className="text-blue-600 dark:text-blue-400 hover:underline">support@gobeyondmeasure.org</a>.
                </p>
              </FAQAccordion>

              <FAQAccordion question="What kind of photos are permitted to be uploaded?">
                <p className="mb-4">
                  We encourage you to use photos that captivate and inspire donors. Keep the following guidelines in mind:
                </p>
                <ul className="list-disc pl-8 mb-4 space-y-2">
                  <li>Display what you'll purchase, but feel free to get creative with your image design as well</li>
                  <li>Avoid using stock images or clipart</li>
                  <li>Protect your students' identities by avoiding images with their faces</li>
                </ul>
                <p>
                  For additional helpful tips, see "How to captivate and inspire donors through project photos" below.
                </p>
              </FAQAccordion>

              <FAQAccordion question="How to captivate and inspire donors through project photos.">
                <p className="mb-4">
                  Consider the following tips to captivate your potential donors!
                </p>
                
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Choose a unique, relevant photo.</h4>
                <p className="mb-4">
                  We recommend using a photo that shows what your specific project is raising funds for. Avoid generic stock images. For example, if you want to buy a few books for your classroom library, you could upload images of the books you want to purchase.
                </p>
                
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Keep dimensions in mind.</h4>
                <p className="mb-4">
                  Images on your project's page will be visible as a horizontal rectangle. Avoid small or square images, as they will appear zoomed in to the center of the image, and the edges will be cut off.
                </p>
                
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Avoid poor picture quality.</h4>
                <p className="mb-4">
                  You don't need to go out of your way to get high quality images, but refrain from using blurry ones. Compel donors to support your project!
                </p>
                
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Protect your students' identity!</h4>
                <p className="mb-4">
                  If you want to post pictures of your students, do not include their faces, names, or anything else that could give away their identity. Also, avoid including your school's name and classroom number in the background. Consider these alternatives to directly posting your students' faces:
                </p>
                <ul className="list-disc pl-8 mb-4 space-y-2">
                  <li>Group your students together and use the backs of their heads</li>
                  <li>Use your classroom decor and student artwork on walls in the background</li>
                </ul>
                
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Stand out by getting creative!</h4>
                <p className="mb-4">
                  Feel free to use design tools like Canva to customize the images on your project's page even more.
                </p>
                
                <p>
                  If you have any questions, comments, or concerns about uploading a photo, please contact us at <a href="mailto:support@gobeyondmeasure.org" className="text-blue-600 dark:text-blue-400 hover:underline">support@gobeyondmeasure.org</a>.
                </p>
              </FAQAccordion>
            </div>
          </section>

          {/* Administrative Accounts Section */}
          <section>
            <h2 className="text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-5">
              Administrative Accounts
            </h2>
            
            <div className="space-y-4">
              <FAQAccordion question="All about your school administrator's account!">              
                <p className="mb-6">
                  Once your administrator account has been created, all your account information is easily accessible from the drop-down tab in your profile. By selecting My Account under your name, you can view and update your account details. To tailor your experience, select Preferences to adjust your personal grade and subject interests. These preferences help Beyond Measure make personalized suggestions based on your interests as an individual, rather than your role as an administrator. Remember to scroll down and click Save Settings whenever you update your information!
                </p>
                
                <p className="mb-6">
                  Once you have completed the Donation Facilitation Agreement required to have an administrative profile, your administrative access will be active through the Admin Portal drop-down tab under your name. Please note, that only one administrative account is available per school.
                </p>
                
                <p className="mb-4">
                  Within your Admin Portal, you can:
                </p>
                
                <ul className="list-disc pl-8 mb-6 space-y-2">
                  <li><strong>Manage Teachers</strong> - Invite teachers to create an account by sending a welcome email with a simple click of a button.</li>
                  <li><strong>Manage Projects</strong> - Review and approve pending projects, edit projects, extend project deadlines, review audit logs, deactivate, and re-assign projects all by clicking on the project.</li>
                  <li><strong>Review Reporting</strong> - With date-filtered reports, you can track your donor information, review projects, analyze trends, and eliminate time-consuming year-end reporting.</li>
                </ul>
              </FAQAccordion>

              <FAQAccordion question="Can't find your school?">
                <p>
                  If you are creating a school administrator account and can't find your school in the list, please contact us at <a href="mailto:support@gobeyondmeasure.org" className="text-blue-600 dark:text-blue-400 hover:underline">support@gobeyondmeasure.org</a>.
                </p>
              </FAQAccordion>

              <FAQAccordion question="Trouble selecting your school?">
                <p>
                  If you're unable to select your school while creating your administrative profile, it's likely because the school's account already has an active administrative profile. If you think this is a mistake, please contact us at <a href="mailto:support@gobeyondmeasure.org" className="text-blue-600 dark:text-blue-400 hover:underline">support@gobeyondmeasure.org</a> for support.
                </p>
              </FAQAccordion>

              <FAQAccordion question="Is there a cost to use goBeyondMeasure.org?">
                <p className="mb-4">
                  No, there is no fee for using the Beyond Measure platform. Our mission is to empower private school teachers by connecting them with passionate donors who want to support educational projects and classroom needs.
                </p>
                <p>
                  All donations made through Beyond Measure are processed directly through the school, in accordance with our Donation Facilitation Agreement. This agreement ensures that every dollar donated goes straight to the teachers, providing them with the necessary resources to enhance their classrooms and inspire their students.
                </p>
              </FAQAccordion>

              <FAQAccordion question="How do I approve pending projects?">
                <p className="mb-4">
                  As an administrator, your support is crucial to the success of the projects created by your teachers. You have oversight on all projects from their conception to completion, and at Beyond Measure, we partner with school administrators to make this process as seamless as possible. Here's how our team supports you when teachers submit projects for approval:
                </p>
                
                <ol className="list-decimal pl-8 mb-4 space-y-2">
                  <li><strong>Notification of New Projects:</strong> After a teacher creates a project, you will receive an email notification sent to the address listed in your account. This email will include the teacher's information and project name.</li>
                  <li><strong>Review and Approval Process:</strong> Upon receiving a notification of a pending project, you can log into your Admin Portal by clicking the link provided in the email. Pending projects can be reviewed and approved through the Manage Projects tab. To locate pending projects quickly, change the "status" in the top bar to "Pending" and click Search. Click on the project's title to review the details. Once you have reviewed the details, you can approve the project for public posting by clicking Approve.</li>
                  <li><strong>Editing and Reassigning Projects:</strong> If a teacher with active projects is no longer employed at your institution, you can re-assign their projects to another teacher. To do this, select the drop-down arrow under Options on the project's status. Additionally, you can edit projects by selecting "Edit".</li>
                  <li><strong>Rejecting Projects:</strong> If a project needs revisions or does not meet approval criteria, you can reject it by selecting the Reject button. When rejecting a project, you have the option to include a note to the teacher explaining the reason for rejection and proposing any necessary revisions. Once a project is rejected, it is sent back to a Draft status in the teacher's Create a Project queue.</li>
                </ol>
                
                <p>
                  If you have any questions, comments, or concerns about pending or posted projects, please email us at <a href="mailto:support@gobeyondmeasure.org" className="text-blue-600 dark:text-blue-400 hover:underline">support@gobeyondmeasure.org</a>.
                </p>
              </FAQAccordion>
            </div>
          </section>

          {/* Donor Accounts Section */}
          <section>
            <h2 className="text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-5">
              Donor Accounts & Donations
            </h2>
            
            <div className="space-y-4">
              <FAQAccordion question="All about your donor profile!">              
                <p className="mb-6">
                  Donors can create a personal account by selecting Donor under Account Type. Once your donor profile has been created, all your account information is easily accessible from the drop-down menu next to your name. By selecting My Account under your name, you can view and update your account details. To tailor your experience, select Preferences to adjust your personal grade and subject interests. These preferences help Beyond Measure make personalized suggestions based on your interests. Remember to scroll down and click Save Settings whenever you update your information!
                </p>
                
                <p className="mb-6">
                  You can view your previous donations in the Donation History tab next to your name in the top right corner of your browser. You can also view your favorite teachers and schools under the Favorites tab in the same area.
                </p>
              </FAQAccordion>

              <FAQAccordion question="Can I donate without creating an account?">
                <p>
                  Yes, you can donate without creating an account. However, creating an account offers several benefits, including the ability to save your payment information and donation preferences for future contributions.
                </p>
              </FAQAccordion>

              <FAQAccordion question="What payment options can I use to donate?">
                <p>
                  We process payments through Stripe and accept all major credit cards, including Visa, MasterCard, American Express, and Discover.
                </p>
              </FAQAccordion>

              <FAQAccordion question="Is my donation amount private?">
                <p className="mb-4">
                  Yes, your donation is private. Your donation amount and contact information will be shared only with the school administrator, provided the school has an active administrative profile. Your name and the corresponding donation amount will not be displayed on the project's page. The project's page will only show the number of donors and the total amount raised.
                </p>
                <p>
                  If you would like to donate anonymously, please contact us at <a href="mailto:support@gobeyondmeasure.org" className="text-blue-600 dark:text-blue-400 hover:underline">support@gobeyondmeasure.org</a>. Please note that if you choose to donate anonymously, a tax-deductible receipt will not be able to be provided.
                </p>
              </FAQAccordion>

              <FAQAccordion question="Is there a minimum amount that must be donated?">
                <p>
                  Yes, the minimum donation to a classroom project is $1. Every dollar goes directly towards supporting teachers at private Christian schools, and we believe that God has abundant blessings to do a lot with a little, so no donation is too small! While we are grateful for donors who wish to go above and beyond, please note that donations can not exceed the total targeted amount for the project.
                </p>
              </FAQAccordion>

              <FAQAccordion question="Is my donation tax-deductible?">
                <p className="mb-4">
                  Yes, donations made through goBeyondMeasure.org are tax-deductible gifts to the recipient school. All participating schools on our platform are registered 501(c)(3) organizations. You will receive a receipt from the recipient school, which can be used for your tax records at the school's discretion.
                </p>
                <p>
                  Please consult your tax advisor regarding your individual tax situation. If you have any questions, comments, or concerns, please contact us at <a href="mailto:support@gobeyondmeasure.org" className="text-blue-600 dark:text-blue-400 hover:underline">support@gobeyondmeasure.org</a>.
                </p>
              </FAQAccordion>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 